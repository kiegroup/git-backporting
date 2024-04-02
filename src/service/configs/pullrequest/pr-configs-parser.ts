import { getAsCleanedCommaSeparatedList, getAsCommaSeparatedList } from "@bp/service/args/args-utils";
import { Args } from "@bp/service/args/args.types";
import ConfigsParser from "@bp/service/configs/configs-parser";
import { Configs } from "@bp/service/configs/configs.types";
import GitClient from "@bp/service/git/git-client";
import GitClientFactory from "@bp/service/git/git-client-factory";
import { BackportPullRequest, GitPullRequest } from "@bp/service/git/git.types";

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

    let targetBranches: string[] = [];
    if (args.targetBranchPattern) {
      // parse labels to extract target branch(es)
      targetBranches = this.getTargetBranchesFromLabels(args.targetBranchPattern, pr.labels);
      if (targetBranches.length === 0) {
        throw new Error(`Unable to extract target branches with regular expression "${args.targetBranchPattern}"`);
      }
    } else {
      // target branch must be provided if targetRegExp is missing
      targetBranches = [...new Set(getAsCommaSeparatedList(args.targetBranch!)!)];
    }
    const bpBranchNames: string[] = [...new Set(args.bpBranchName ? (getAsCleanedCommaSeparatedList(args.bpBranchName) ?? []) : [])];

    if (bpBranchNames.length > 1 && bpBranchNames.length != targetBranches.length) {
      throw new Error(`The number of backport branch names, if provided, must match the number of target branches or just one, provided ${bpBranchNames.length} branch names instead`);
    }

    return {
      dryRun: args.dryRun!,
      auth: args.auth, // this has been already pre-processed before parsing configs
      folder: `${folder.startsWith("/") ? "" : process.cwd() + "/"}${args.folder ?? this.getDefaultFolder()}`,
      mergeStrategy: args.strategy,
      mergeStrategyOption: args.strategyOption,
      cherryPickOptions: args.cherryPickOptions,
      originalPullRequest: pr,
      backportPullRequests: this.generateBackportPullRequestsData(pr, args, targetBranches, bpBranchNames),
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
   * Parse the provided labels and return a list of target branches
   * obtained by applying the provided pattern as regular expression extractor
   * @param pattern reg exp pattern to extract target branch from label name
   * @param labels list of labels to check
   * @returns list of target branches
   */
  private getTargetBranchesFromLabels(pattern: string, labels: string[]): string[] {
    this.logger.debug(`Extracting branches from [${labels}] using ${pattern}`);
    const regExp = new RegExp(pattern);

    const branches: string[] = [];
    for (const l of labels) {
      const result = regExp.exec(l);

      if (result?.groups) {
        const { target } = result.groups;
        if (target){
          branches.push(target);
        }
      }
    }


    return [...new Set(branches)];
  }

  /**
   * Create a backport pull request starting from the target branch and 
   * the original pr to be backported
   * @param originalPullRequest original pull request
   * @param targetBranch target branch where the backport should be applied
   * @returns {GitPullRequest}
   */
  private generateBackportPullRequestsData(
    originalPullRequest: GitPullRequest, 
    args: Args, 
    targetBranches: string[], 
    bpBranchNames: string[]
  ): BackportPullRequest[] {

    const reviewers = args.reviewers ?? [];
    if (reviewers.length == 0 && args.inheritReviewers) {
      // inherit only if args.reviewers is empty and args.inheritReviewers set to true
      reviewers.push(originalPullRequest.author);
      if (originalPullRequest.mergedBy) {
        reviewers.push(originalPullRequest.mergedBy);  
      }
    }

    const bodyPrefix = args.bodyPrefix ?? `**Backport:** ${originalPullRequest.htmlUrl}\r\n\r\n`;
    const body = bodyPrefix + (args.body ?? `${originalPullRequest.body}`);
    
    const labels = args.labels ?? [];
    if (args.inheritLabels) {
      labels.push(...originalPullRequest.labels);
    }

    return targetBranches.map((tb, idx) => {

      // if there multiple branch names take the corresponding one, otherwise get the the first one if it exists
      let backportBranch = bpBranchNames.length > 1 ? bpBranchNames[idx] : bpBranchNames[0];
      if (backportBranch === undefined || backportBranch.trim() === "") {
        // for each commit takes the first 7 chars that are enough to uniquely identify them in most of the projects
        const concatenatedCommits: string = originalPullRequest.commits!.map(c => c.slice(0, 7)).join("-");
        backportBranch = `bp-${tb}-${concatenatedCommits}`;
      } else if (bpBranchNames.length == 1 && targetBranches.length > 1) {
        // multiple targets and single custom backport branch name we need to differentiate branch names
        // so append "-${tb}" to the provided name
        backportBranch = backportBranch + `-${tb}`;
      }
  
      if (backportBranch.length > 250) {
        this.logger.warn(`Backport branch (length=${backportBranch.length}) exceeded the max length of 250 chars, branch name truncated!`);
        backportBranch = backportBranch.slice(0, 250);
      }

      return {
        owner: originalPullRequest.targetRepo.owner,
        repo: originalPullRequest.targetRepo.project,
        head: backportBranch,
        base: tb,
        title: args.title ?? `[${tb}] ${originalPullRequest.title}`,
        // preserve new line chars
        body: body.replace(/\\n/g, "\n").replace(/\\r/g, "\r"),
        reviewers: [...new Set(reviewers)],
        assignees: [...new Set(args.assignees)],
        labels: [...new Set(labels)],
        comments: args.comments?.map(c => c.replace(/\\n/g, "\n").replace(/\\r/g, "\r")) ?? [],
      };
    }) as BackportPullRequest[];
  }
}