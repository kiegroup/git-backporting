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
      folder: `${folder.startsWith("/") ? "" : process.cwd() + "/"}${args.folder ?? this.getDefaultFolder()}`,
      targetBranch: args.targetBranch,
      originalPullRequest: pr,
      backportPullRequest: this.getDefaultBackportPullRequest(pr, args),
      git: {
        user: args.gitUser,
        email: args.gitEmail,
      }
    };
  }
  
  private getDefaultFolder() {
    return "bp";
  }

  /**
   * Create a backport pull request starting from the target branch and 
   * the original pr to be backported
   * @param originalPullRequest original pull request
   * @param targetBranch target branch where the backport should be applied
   * @returns {GitPullRequest}
   */
  private getDefaultBackportPullRequest(originalPullRequest: GitPullRequest, args: Args): GitPullRequest {
    const reviewers = args.reviewers ?? [];
    if (reviewers.length == 0 && args.inheritReviewers) {
      // inherit only if args.reviewers is empty and args.inheritReviewers set to true
      reviewers.push(originalPullRequest.author);
      if (originalPullRequest.mergedBy) {
        reviewers.push(originalPullRequest.mergedBy);  
      }
    }

    const bodyPrefix = args.bodyPrefix ?? `**Backport:** ${originalPullRequest.htmlUrl}\r\n\r\n`;
    const body = args.body ?? `${originalPullRequest.body}\r\n\r\nPowered by [BPer](https://github.com/lampajr/backporting).`;
    
    return {
      author: args.gitUser,
      title: args.title ?? `[${args.targetBranch}] ${originalPullRequest.title}`, 
      body: `${bodyPrefix}${body}`,
      reviewers: [...new Set(reviewers)],
      assignees: [...new Set(args.assignees)],
      targetRepo: originalPullRequest.targetRepo,
      sourceRepo: originalPullRequest.targetRepo,
      branchName: args.bpBranchName,
      // nCommits: 0, // not needed, but required by the 
      // commits: [] // not needed
    };
  }
}