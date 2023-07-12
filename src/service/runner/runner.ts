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
import { inferGitClient, inferGitApiUrl } from "@bp/service/git/git-util";

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
    const gitClientType: GitClientType = inferGitClient(args.pullRequest);
    // right now the apiVersion is set to v4
    const apiUrl = inferGitApiUrl(args.pullRequest);
    const gitApi: GitClient = GitClientFactory.getOrCreate(gitClientType, args.auth, apiUrl);

    // 3. parse configs
    this.logger.debug("Parsing configs..");
    const configs: Configs = await new PullRequestConfigsParser().parseAndValidate(args);
    const originalPR: GitPullRequest = configs.originalPullRequest;
    const backportPR: GitPullRequest = configs.backportPullRequest;

    // start local git operations
    const git: GitCLIService = new GitCLIService(configs.auth, configs.git);
    
    // 4. clone the repository
    this.logger.debug("Cloning repo..");
    await git.clone(configs.originalPullRequest.targetRepo.cloneUrl, configs.folder, configs.targetBranch);

    // 5. create new branch from target one and checkout
    this.logger.debug("Creating local branch..");
    let backportBranch = backportPR.branchName;
    if (backportBranch === undefined || backportBranch.trim() === "") {
      // for each commit takes the first 7 chars that are enough to uniquely identify them in most of the projects
      const concatenatedCommits: string = originalPR.commits!.map(c => c.slice(0, 7)).join("-");
      backportBranch = `bp-${configs.targetBranch}-${concatenatedCommits}`;
    }

    if (backportBranch.length > 250) {
      this.logger.warn(`Backport branch (length=${backportBranch.length}) exceeded the max length of 250 chars, branch name truncated!`);
      backportBranch = backportBranch.slice(0, 250);
    }

    await git.createLocalBranch(configs.folder, backportBranch);

    // 6. fetch pull request remote if source owner != target owner or pull request still open
    if (configs.originalPullRequest.sourceRepo.owner !== configs.originalPullRequest.targetRepo.owner || 
        configs.originalPullRequest.state === "open") {
          this.logger.debug("Fetching pull request remote..");
      const prefix = gitClientType === GitClientType.GITHUB ? "pull" : "merge-requests"; // default is for gitlab
      await git.fetch(configs.folder, `${prefix}/${configs.originalPullRequest.number}/head:pr/${configs.originalPullRequest.number}`);
    }

    // 7. apply all changes to the new branch
    this.logger.debug("Cherry picking commits..");
    for (const sha of originalPR.commits!) {
      await git.cherryPick(configs.folder, sha, configs.mergeStrategy, configs.mergeStrategyOption);
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
      labels: backportPR.labels,
    };

    if (!configs.dryRun) {
      // 8. push the new branch to origin
      await git.push(configs.folder, backportBranch);

      // 9. create pull request new branch -> target branch (using octokit)
      const prUrl = await gitApi.createPullRequest(backport);
      this.logger.info(`Pull request created: ${prUrl}`);

    } else {
      this.logger.warn("Pull request creation and remote push skipped!");
      this.logger.info(`${JSON.stringify(backport, null, 2)}`);
    }
  }

}