import { Args } from "@bp/service/args/args.types";
import ConfigsParser from "@bp/service/configs/configs-parser";
import { Configs } from "@bp/service/configs/configs.types";
import GitClient from "@bp/service/git/git-client";
import GitClientFactory from "@bp/service/git/git-client-factory";
import { GitPullRequest } from "@bp/service/git/git.types";

export default class PullRequestConfigsParser extends ConfigsParser {

  private gitClient: GitClient;

  constructor() {
    super();
    this.gitClient = GitClientFactory.getClient();
  }
  
  public async parse(args: Args): Promise<Configs> {
    let pr: GitPullRequest; 
    try {
      pr = await this.gitClient.getPullRequestFromUrl(args.pullRequest, args.squash!);
    } catch(error) {
      this.logger.error("Something went wrong retrieving pull request");
      throw error;
    }

    const folder: string = args.folder ?? this.getDefaultFolder();

    return {
      dryRun: args.dryRun!,
      auth: args.auth,
      folder: `${folder.startsWith("/") ? "" : process.cwd() + "/"}${args.folder ?? this.getDefaultFolder()}`,
      targetBranch: args.targetBranch,
      originalPullRequest: pr,
      backportPullRequest: this.getDefaultBackportPullRequest(pr, args),
      git: {
        user: args.gitUser ?? this.gitClient.getDefaultGitUser(),
        email: args.gitEmail ?? this.gitClient.getDefaultGitEmail(),
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
    const body = args.body ?? `${originalPullRequest.body}`;
    
    const labels = args.labels ?? [];
    if (args.inheritLabels) {
      labels.push(...originalPullRequest.labels);
    }

    return {
      author: args.gitUser ?? this.gitClient.getDefaultGitUser(),
      title: args.title ?? `[${args.targetBranch}] ${originalPullRequest.title}`, 
      body: `${bodyPrefix}${body}`,
      reviewers: [...new Set(reviewers)],
      assignees: [...new Set(args.assignees)],
      labels: [...new Set(labels)],
      targetRepo: originalPullRequest.targetRepo,
      sourceRepo: originalPullRequest.targetRepo,
      branchName: args.bpBranchName,
    };
  }
}