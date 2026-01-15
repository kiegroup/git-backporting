import ArgsParser from "@bp/service/args/args-parser";
import { Args } from "@bp/service/args/args.types";
import { Configs } from "@bp/service/configs/configs.types";
import PullRequestConfigsParser from "@bp/service/configs/pullrequest/pr-configs-parser";
import GitCLIService from "@bp/service/git/git-cli";
import GitClient from "@bp/service/git/git-client";
import GitClientFactory from "@bp/service/git/git-client-factory";
import { BackportPullRequest, GitClientType } from "@bp/service/git/git.types";
import LoggerService from "@bp/service/logger/logger-service";
import LoggerServiceFactory from "@bp/service/logger/logger-service-factory";
import { inferGitClient, inferGitApiUrl, getGitTokenFromEnv } from "@bp/service/git/git-util";
import { injectError, injectTargetBranch } from "./runner-util";

interface Git {
  gitClientType: GitClientType;
  gitClientApi: Pick<GitClient, ("createPullRequest" | "createPullRequestComment")>;
  gitCli: Pick<GitCLIService, ("clone" | "createLocalBranch" | "fetch" | "cherryPick" | "push")>;
}

/**
 * Main runner implementation, it implements the core logic flow
 */
export default class Runner {

  private logger: LoggerService;
  private argsParser: ArgsParser;

  constructor(parser: ArgsParser) {
    this.logger = LoggerServiceFactory.getLogger();
    this.argsParser = parser;
  }

  /**
   * Entry point invoked by the command line or gha
   */
  async run(): Promise<void> {
    try {
      await this.execute();

      this.logger.info("Process succeeded");
      process.exit(0);

    } catch (error) {
      this.logger.error(`${error}`);
      
      this.logger.info("Process failed");
      process.exit(1);
    }
  }

  /**
   * Core logic
   */
  async execute(): Promise<void>{

    // 1. parse args
    const args: Args = this.argsParser.parse();

    if (args.dryRun) {
      this.logger.warn("Dry run enabled");
    }

    // 2. init git service
    let gitClientType: GitClientType;
    if (args.gitClient === undefined) {
      gitClientType = inferGitClient(args.pullRequest);
    } else {
      gitClientType = args.gitClient as GitClientType;
    }
    // the api version is ignored in case of github
    const apiUrl = inferGitApiUrl(args.pullRequest, gitClientType === GitClientType.CODEBERG ? "v1" : undefined);
    const token = this.fetchToken(args, gitClientType);
    const gitApi: GitClient = GitClientFactory.getOrCreate(gitClientType, token, apiUrl);

    // 3. parse configs
    this.logger.debug("Parsing configs..");
    args.auth = token; // override auth
    const configs: Configs = await new PullRequestConfigsParser().parseAndValidate(args);
    const backportPRs: BackportPullRequest[] = configs.backportPullRequests;

    // start local git operations
    const git: GitCLIService = new GitCLIService(configs.auth, configs.git);
    
    const failures: string[] = [];
    // we need sequential backporting as they will operate on the same folder
    // avoid cloning the same repo multiple times
    for (const pr of backportPRs) {
      this.logger.setContext(pr.base);
      try {
        await this.executeBackport(configs, pr, {
          gitClientType: gitClientType,
          gitClientApi: gitApi,
          gitCli: git,
        });
      } catch (error) {
        failures.push(error as string);
      }
      this.logger.clearContext();
    }

    if (failures.length > 0) {
      throw new Error(`Failure occurred during one of the backports: [${failures.join(" ; ")}]`);
    }
  }

  /**
   * Fetch the GIT token from the provided Args obj, if not empty, otherwise fallback
   * to the environment variables.
   * @param args input arguments
   * @param gitType git client type
   * @returns the provided or fetched token, or undefined if not set anywhere
   */
  fetchToken(args: Args, gitType: GitClientType): string | undefined {
    let token = args.auth;
    if (token === undefined) {
      // try to fetch the auth from env variable
      this.logger.info("Auth argument not provided, checking available tokens from env..");
      token = getGitTokenFromEnv(gitType);
      if (!token) {
        this.logger.info("Git token not found in the environment");
      }
    }

    return token;
  }

  async executeBackport(configs: Configs, backportPR: BackportPullRequest, git: Git): Promise<void> {
    let i = 0;
    for (const step of backportSteps(this.logger, configs, backportPR, git)) {
      try {
        await step();
      } catch (error) {
        this.logger.error(`Something went wrong backporting to ${backportPR.base}: ${error}`);
        if (!configs.dryRun && configs.errorNotification.enabled && configs.errorNotification.message.length > 0) {
          // notify the failure as comment in the original pull request
          let comment = injectError(configs.errorNotification.message, error as string);
          comment = injectTargetBranch(comment, backportPR.base);
          try {
            let script = "\n\nReconstruction of the attempted steps (beware that escaping may be missing):\n```sh\n";
            script += await backportScript(configs, backportPR, git, i);
            script += "```";
            comment += script;
          } catch (scriptError) {
            this.logger.error(`Something went wrong reconstructing the script: ${scriptError}`);
          }
          await git.gitClientApi.createPullRequestComment(configs.originalPullRequest.url, comment);
        }
        throw error;
      }
      i++;
    }
  }
}


function* backportSteps(logger: Pick<LoggerService, "debug" | "info" | "warn">, configs: Configs, backportPR: BackportPullRequest, git: Git): Generator<() => Promise<void>, void, unknown> {
  // every failible operation should be in one dedicated closure

  // 4. clone the repository
  yield async () => {
    logger.debug("Cloning repo..");
    await git.gitCli.clone(configs.originalPullRequest.targetRepo.cloneUrl, configs.folder, backportPR.base);
  };

  // 5. create new branch from target one and checkout
  yield async () => {
    logger.debug("Creating local branch..");
    await git.gitCli.createLocalBranch(configs.folder, backportPR.head);
  };

  // 6. fetch pull request remote if source owner != target owner or pull request still open
  if (configs.originalPullRequest.sourceRepo.owner !== configs.originalPullRequest.targetRepo.owner ||
    configs.originalPullRequest.state === "open") {
    yield async () => {
      logger.debug("Fetching pull request remote..");
      const prefix = git.gitClientType === GitClientType.GITLAB ? "merge-requests" : "pull"; // default is for gitlab
      await git.gitCli.fetch(configs.folder, `${prefix}/${configs.originalPullRequest.number}/head:pr/${configs.originalPullRequest.number}`);
    };
  }

  // 7. apply all changes to the new branch
  yield async () => {
    logger.debug("Cherry picking commits..");
  };
  for (const sha of configs.originalPullRequest.commits) {
    yield async () => {
      await git.gitCli.cherryPick(configs.folder, sha, configs.mergeStrategy, configs.mergeStrategyOption, configs.cherryPickOptions);
    };
  }

  if (!configs.dryRun) {
    // 8. push the new branch to origin
    yield async () => {
      await git.gitCli.push(configs.folder, backportPR.head);
    };

    // 9. create pull request new branch -> target branch (using octokit)
    yield async () => {
      const prUrl = await git.gitClientApi.createPullRequest(backportPR);
      logger.info(`Pull request created: ${prUrl}`);
    };
  } else {
    yield async () => {
      logger.warn("Pull request creation and remote push skipped");
      logger.info(`${JSON.stringify(backportPR, null, 2)}`);
    };
  }
}

// backportScript reconstruct the git commands that were run to attempt the backport.
async function backportScript(configs: Configs, backportPR: BackportPullRequest, git: Git, failed: number): Promise<string> {
  let s = "";
  const fakeLogger = {
    debug: function(_message: string): void { /*discard*/ },
    info: function(_message: string): void { /*discard*/ },
    warn: function(_message: string): void { /*discard*/ },
  };
  const fakeGitCli: Git["gitCli"] = {
    async clone(_from: string, _to: string, _branch: string): Promise<void> {
      /* consider that the user already has the repo cloned (or knows how to clone) */
      s += `git fetch origin ${backportPR.base}`;
    },
    async createLocalBranch(_cwd: string, newBranch: string): Promise<void> {
      s += `git switch -c ${newBranch} origin/${backportPR.base}`;
    },
    async fetch(_cwd: string, branch: string, remote = "origin"): Promise<void> {
      s += `git fetch ${remote} ${branch}`;
    },
    async cherryPick(_cwd: string, sha: string, strategy = "recursive", strategyOption = "theirs", cherryPickOptions: string | undefined): Promise<void> {
      s += `git cherry-pick -m 1 --strategy=${strategy} --strategy-option=${strategyOption} `;
      if (cherryPickOptions !== undefined) {
        s += cherryPickOptions + " ";
      }
      s += sha;
    },
    async push(_cwd: string, branch: string, remote = "origin", force = false): Promise<void> {
      s += `git push ${remote} ${branch}`;
      if (force) {
        s += " --force";
      }
    }
  };
  let i = 0;
  let steps = "";
  for (const step of backportSteps(fakeLogger, configs, backportPR, {
    gitClientType: git.gitClientType,
    gitClientApi: {
      async createPullRequest(_backport: BackportPullRequest): Promise<string> {
        s += `# ${git.gitClientType}.createPullRequest`;
        return "";
      },
      async createPullRequestComment(_prUrl: string, _comment: string): Promise<string | undefined> {
        s += `# ${git.gitClientType}.createPullRequestComment`;
        return "";
      }
    },
    gitCli: fakeGitCli,
  })) {
    if (i == failed) {
      s += "# the step below failed\n";
    }
    await step();
    if (s.length > 0 || i == failed) {
      steps += s + "\n";
      s = "";
    }
    i++;
  }

  return steps;
}
