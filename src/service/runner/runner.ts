import ArgsParser from "@bp/service/args/args-parser";
import { Args } from "@bp/service/args/args.types";
import { Configs } from "@bp/service/configs/configs.types";
import PullRequestConfigsParser from "@bp/service/configs/pullrequest/pr-configs-parser";
import GitCLIService from "@bp/service/git/git-cli";
import GitClient from "@bp/service/git/git-client";
import GitClientFactory from "@bp/service/git/git-client-factory";
import { BackportPullRequest, GitClientType, GitPullRequest } from "@bp/service/git/git.types";
import LoggerService from "@bp/service/logger/logger-service";
import LoggerServiceFactory from "@bp/service/logger/logger-service-factory";
import { inferGitClient, inferGitApiUrl, getGitTokenFromEnv } from "@bp/service/git/git-util";
import { injectError, injectTargetBranch } from "./runner-util";

interface Git {
  gitClientType: GitClientType;
  gitClientApi: GitClient;
  gitCli: GitCLIService;
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
    for(const pr of backportPRs) {
      try {
        await this.executeBackport(configs, pr, {
          gitClientType: gitClientType,
          gitClientApi: gitApi,
          gitCli: git,
        });
      } catch(error) {
        this.logger.error(`Something went wrong backporting to ${pr.base}: ${error}`);
        if (!configs.dryRun && configs.errorNotification.enabled && configs.errorNotification.message.length > 0) {
          // notify the failure as comment in the original pull request
          let comment = injectError(configs.errorNotification.message, error as string);
          comment = injectTargetBranch(comment, pr.base);
          await gitApi.createPullRequestComment(configs.originalPullRequest.url, comment);
        }
        failures.push(error as string);
      }
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
    this.logger.setContext(backportPR.base);

    const originalPR: GitPullRequest = configs.originalPullRequest;

    // 4. clone the repository
    this.logger.debug("Cloning repo..");
    await git.gitCli.clone(configs.originalPullRequest.targetRepo.cloneUrl, configs.folder, backportPR.base);

    // 5. create new branch from target one and checkout
    this.logger.debug("Creating local branch..");
    await git.gitCli.createLocalBranch(configs.folder, backportPR.head);

    // 6. fetch pull request remote if source owner != target owner or pull request still open
    if (configs.originalPullRequest.sourceRepo.owner !== configs.originalPullRequest.targetRepo.owner || 
        configs.originalPullRequest.state === "open") {
      this.logger.debug("Fetching pull request remote..");
      const prefix = git.gitClientType === GitClientType.GITLAB ? "merge-requests" : "pull" ; // default is for gitlab
      await git.gitCli.fetch(configs.folder, `${prefix}/${configs.originalPullRequest.number}/head:pr/${configs.originalPullRequest.number}`);
    }

    // 7. apply all changes to the new branch
    this.logger.debug("Cherry picking commits..");
    for (const sha of originalPR.commits) {
      await git.gitCli.cherryPick(configs.folder, sha, configs.mergeStrategy, configs.mergeStrategyOption, configs.cherryPickOptions);
    }

    if (!configs.dryRun) {
      // 8. push the new branch to origin
      await git.gitCli.push(configs.folder, backportPR.head);

      // 9. create pull request new branch -> target branch (using octokit)
      const prUrl = await git.gitClientApi.createPullRequest(backportPR);
      this.logger.info(`Pull request created: ${prUrl}`);

    } else {
      this.logger.warn("Pull request creation and remote push skipped");
      this.logger.info(`${JSON.stringify(backportPR, null, 2)}`);
    }

    this.logger.clearContext();
  }
}
