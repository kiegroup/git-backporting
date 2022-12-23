import { Args } from "@bp/service/args/args.types";
import ConfigsParser from "@bp/service/configs/configs-parser";
import { Configs } from "@bp/service/configs/configs.types";
import GitService from "@bp/service/git/git-service";
import GitServiceFactory from "@bp/service/git/git-service-factory";
import { GitPullRequest } from "@bp/service/git/git.types";

export default class PullRequestConfigsParser extends ConfigsParser {

  private gitService: GitService;

  constructor() {
    super();
    this.gitService = GitServiceFactory.getService();
  }
  
  public async parse(args: Args): Promise<Configs> {
    const pr: GitPullRequest = await this.gitService.getPullRequestFromUrl(args.pullRequest);
    const folder: string = args.folder ?? this.getDefaultFolder();

    return {
      dryRun: args.dryRun,
      auth: args.auth,
      author: args.author ?? pr.author,
      folder: `${folder.startsWith("/") ? "" : process.cwd() + "/"}${args.folder ?? this.getDefaultFolder()}`,
      targetBranch: args.targetBranch,
      originalPullRequest: pr,
      backportPullRequest: this.getDefaultBackportPullRequest(pr, args.targetBranch)
    };
  }
  
  private getDefaultFolder() {
    return "bp";
  }

  /**
   * Create a default backport pull request starting from the target branch and 
   * the original pr to be backported
   * @param originalPullRequest original pull request
   * @param targetBranch target branch where the backport should be applied
   * @returns {GitPullRequest}
   */
  private getDefaultBackportPullRequest(originalPullRequest: GitPullRequest, targetBranch: string): GitPullRequest {
    const reviewers = [];
    reviewers.push(originalPullRequest.author);
    if (originalPullRequest.mergedBy) {
      reviewers.push(originalPullRequest.mergedBy);  
    }

    return {
      author: originalPullRequest.author,
      title: `[${targetBranch}] ${originalPullRequest.title}`, 
      body: `**Backport:** ${originalPullRequest.htmlUrl}\r\n\r\n${originalPullRequest.body}\r\n\r\nPowered by [BPer](https://github.com/lampajr/backporting).`,
      reviewers: [...new Set(reviewers)],
      targetRepo: originalPullRequest.targetRepo,
      sourceRepo: originalPullRequest.targetRepo,
      commits: [] // TODO needed?
    };
  }
}