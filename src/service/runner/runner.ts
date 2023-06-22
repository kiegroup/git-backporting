import ArgsParser from "@bp/service/args/args-parser";
import { Args } from "@bp/service/args/args.types";
import { Configs } from "@bp/service/configs/configs.types";
import PullRequestConfigsParser from "@bp/service/configs/pullrequest/pr-configs-parser";
import GitCLIService from "@bp/service/git/git-cli";
import GitService from "@bp/service/git/git-service";
import GitServiceFactory from "@bp/service/git/git-service-factory";
import { BackportPullRequest, GitPullRequest, GitServiceType } from "@bp/service/git/git.types";
import LoggerService from "@bp/service/logger/logger-service";
import LoggerServiceFactory from "@bp/service/logger/logger-service-factory";

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
   * Infer the remote GIT service to interact with based on the provided 
   * pull request URL
   * @param prUrl provided pull request URL
   * @returns {GitServiceType}
   */
  private inferRemoteGitService(prUrl: string): GitServiceType {
    const stdPrUrl = prUrl.toLowerCase().trim();

    if (stdPrUrl.includes(GitServiceType.GITHUB.toString())) {
      return GitServiceType.GITHUB;
    }

    throw new Error(`Remote GIT service not recognixed from PR url: ${prUrl}`);
  }

  /**
   * Entry point invoked by the command line or gha
   */
  async run(): Promise<void> {
    this.logger.info("Starting process.");

    try {
      await this.execute();

      this.logger.info("Process succeeded!");
      process.exit(0);

    } catch (error) {
      this.logger.error(`${error}`);
      
      this.logger.info("Process failed!");
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
      this.logger.warn("Dry run enabled!");
    }

    // 2. init git service
    GitServiceFactory.init(this.inferRemoteGitService(args.pullRequest), args.auth);
    const gitApi: GitService = GitServiceFactory.getService();

    // 3. parse configs
    const configs: Configs = await new PullRequestConfigsParser().parseAndValidate(args);
    const originalPR: GitPullRequest = configs.originalPullRequest;
    const backportPR: GitPullRequest = configs.backportPullRequest;

    // start local git operations
    const git: GitCLIService = new GitCLIService(configs.auth, configs.git);
    
    // 4. clone the repository
    await git.clone(configs.originalPullRequest.targetRepo.cloneUrl, configs.folder, configs.targetBranch);

    // 5. create new branch from target one and checkout
    const backportBranch = backportPR.branchName ?? `bp-${configs.targetBranch}-${originalPR.commits.join("-")}`;
    await git.createLocalBranch(configs.folder, backportBranch);

    // 6. fetch pull request remote if source owner != target owner or pull request still open
    if (configs.originalPullRequest.sourceRepo.owner !== configs.originalPullRequest.targetRepo.owner || 
        configs.originalPullRequest.state === "open") {
      await git.fetch(configs.folder, `pull/${configs.originalPullRequest.number}/head:pr/${configs.originalPullRequest.number}`);
    }

    // 7. apply all changes to the new branch
    for (const sha of originalPR.commits) {
      await git.cherryPick(configs.folder, sha);
    }

    const backport: BackportPullRequest = {
      owner: originalPR.targetRepo.owner,
      repo: originalPR.targetRepo.project,
      head: backportBranch,
      base: configs.targetBranch,
      title: backportPR.title,
      body: backportPR.body,
      reviewers: backportPR.reviewers,
      assignees: backportPR.assignees,
    };

    if (!configs.dryRun) {
      // 8. push the new branch to origin
      await git.push(configs.folder, backportBranch);

      // 9. create pull request new branch -> target branch (using octokit)
      await gitApi.createPullRequest(backport);

    } else {
      this.logger.warn("Pull request creation and remote push skipped!");
      this.logger.info(`${JSON.stringify(backport, null, 2)}`);
    }
  }

}