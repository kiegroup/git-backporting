import { Args } from "@bp/service/args/args.types";

/**
 * Abstract arguments parser interface in charge to parse inputs and 
 * produce a common Args object
 */
export default abstract class ArgsParser {

  abstract readArgs(): Args;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private getOrDefault(parsedValue: any, defaultValue?: any) {
    return parsedValue === undefined ? defaultValue : parsedValue;
  }

  public parse(): Args {
    const args = this.readArgs();

    // validate and fill with defaults
    if (!args.pullRequest || !args.targetBranch) {
      throw new Error("Missing option: pull request and target branch must be provided");
    }
    
    return {
      pullRequest: args.pullRequest,
      targetBranch: args.targetBranch,
      dryRun: this.getOrDefault(args.dryRun, false),
      auth: this.getOrDefault(args.auth),
      folder: this.getOrDefault(args.folder),
      gitUser: this.getOrDefault(args.gitUser),
      gitEmail: this.getOrDefault(args.gitEmail),
      title: this.getOrDefault(args.title),
      body: this.getOrDefault(args.body),
      bodyPrefix: this.getOrDefault(args.bodyPrefix),
      bpBranchName: this.getOrDefault(args.bpBranchName),
      reviewers: this.getOrDefault(args.reviewers, []),
      assignees: this.getOrDefault(args.assignees, []),
      inheritReviewers: this.getOrDefault(args.inheritReviewers, true),
      labels: this.getOrDefault(args.labels, []),
      inheritLabels: this.getOrDefault(args.inheritLabels, false),
      squash: this.getOrDefault(args.squash, true),
      strategy: this.getOrDefault(args.strategy),
      strategyOption: this.getOrDefault(args.strategyOption),
    };
  }
}