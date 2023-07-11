import ArgsParser from "@bp/service/args/args-parser";
import { Args } from "@bp/service/args/args.types";
import { getInput } from "@actions/core";
import { getAsBooleanOrDefault, getAsCleanedCommaSeparatedList, getAsCommaSeparatedList, getOrUndefined, readConfigFile } from "@bp/service/args/args-utils";

export default class GHAArgsParser extends ArgsParser {

  readArgs(): Args {
    const configFile = getOrUndefined(getInput("config-file"));

    let args: Args; 
    if (configFile) {
      args = readConfigFile(configFile);
    } else {
      args = {
        dryRun: getAsBooleanOrDefault(getInput("dry-run")),
        auth: getOrUndefined(getInput("auth")),
        pullRequest: getInput("pull-request"),
        targetBranch: getInput("target-branch"),
        folder: getOrUndefined(getInput("folder")),
        gitUser: getOrUndefined(getInput("git-user")),
        gitEmail: getOrUndefined(getInput("git-email")),
        title: getOrUndefined(getInput("title")),
        body: getOrUndefined(getInput("body")),
        bodyPrefix: getOrUndefined(getInput("body-prefix")),
        bpBranchName: getOrUndefined(getInput("bp-branch-name")),
        reviewers: getAsCleanedCommaSeparatedList(getInput("reviewers")),
        assignees: getAsCleanedCommaSeparatedList(getInput("assignees")),
        inheritReviewers: !getAsBooleanOrDefault(getInput("no-inherit-reviewers")),
        labels: getAsCommaSeparatedList(getInput("labels")),
        inheritLabels: getAsBooleanOrDefault(getInput("inherit-labels")),
        squash: !getAsBooleanOrDefault(getInput("no-squash")),
      };
    }

    return args;
  }

}