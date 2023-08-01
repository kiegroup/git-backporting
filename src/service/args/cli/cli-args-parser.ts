import ArgsParser from "@bp/service/args/args-parser";
import { Args } from "@bp/service/args/args.types";
import { Command } from "commander";
import { name, version, description } from "@bp/../package.json";
import { getAsCleanedCommaSeparatedList, getAsCommaSeparatedList, getAsSemicolonSeparatedList, readConfigFile } from "@bp/service/args/args-utils";

export default class CLIArgsParser extends ArgsParser {

  private getCommand(): Command {
    return new Command(name)
      .version(version)
      .description(description)
      .option("-tb, --target-branch <branches>", "comma separated list of branches where changes must be backported to")
      .option("-pr, --pull-request <pr-url>", "pull request url, e.g., https://github.com/kiegroup/git-backporting/pull/1")
      .option("-d, --dry-run", "if enabled the tool does not create any pull request nor push anything remotely")
      .option("-a, --auth <auth>", "git service authentication string, e.g., github token")
      .option("-gu, --git-user <git-user>", "local git user name, default is 'GitHub'")
      .option("-ge, --git-email <git-email>", "local git user email, default is 'noreply@github.com'")
      .option("-f, --folder <folder>", "local folder where the repo will be checked out, e.g., /tmp/folder")
      .option("--title <bp-title>", "backport pr title, default original pr title prefixed by target branch")
      .option("--body <bp-body>", "backport pr title, default original pr body prefixed by bodyPrefix")
      .option("--body-prefix <bp-body-prefix>", "backport pr body prefix, default `backport <original-pr-link>`")
      .option("--bp-branch-name <bp-branch-names>", "comma separated list of backport pr branch names, default auto-generated by the commit and target branch")
      .option("--reviewers <reviewers>", "comma separated list of reviewers for the backporting pull request", getAsCleanedCommaSeparatedList)
      .option("--assignees <assignees>", "comma separated list of assignees for the backporting pull request", getAsCleanedCommaSeparatedList)
      .option("--no-inherit-reviewers", "if provided and reviewers option is empty then inherit them from original pull request")
      .option("--labels <labels>", "comma separated list of labels to be assigned to the backported pull request", getAsCommaSeparatedList)
      .option("--inherit-labels", "if true the backported pull request will inherit labels from the original one")
      .option("--no-squash", "if provided the tool will backport all commits as part of the pull request")
      .option("--strategy <strategy>", "cherry-pick merge strategy, default to 'recursive'", undefined)
      .option("--strategy-option <strategy-option>", "cherry-pick merge strategy option, default to 'theirs'")
      .option("--comments <comments>", "semicolon separated list of additional comments to be posted to the backported pull request", getAsSemicolonSeparatedList)
      .option("-cf, --config-file <config-file>", "configuration file containing all valid options, the json must match Args interface");
  }

  readArgs(): Args {
    const opts = this.getCommand()
      .parse()
      .opts();
    
    let args: Args; 
    if (opts.configFile) {
      // if config file is set ignore all other options
      args = readConfigFile(opts.configFile);
    } else {
      args = {
        dryRun: opts.dryRun,
        auth: opts.auth,
        pullRequest: opts.pullRequest,
        targetBranch: opts.targetBranch,
        folder: opts.folder,
        gitUser: opts.gitUser,
        gitEmail: opts.gitEmail,
        title: opts.title,
        body: opts.body,
        bodyPrefix: opts.bodyPrefix,
        bpBranchName: opts.bpBranchName,
        reviewers: opts.reviewers,
        assignees: opts.assignees,
        inheritReviewers: opts.inheritReviewers,
        labels: opts.labels,
        inheritLabels: opts.inheritLabels,
        squash: opts.squash,
        strategy: opts.strategy,
        strategyOption: opts.strategyOption,
        comments: opts.comments,
      };
    }

    return args;
  }

}