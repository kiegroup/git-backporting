import ArgsParser from "@bp/service/args/args-parser";
import { Args } from "@bp/service/args/args.types";
import { getInput } from "@actions/core";
import { readConfigFile } from "@bp/service/args/args-utils";

export default class GHAArgsParser extends ArgsParser {

  /**
   * Return the input only if it is not a blank or null string, otherwise returns undefined
   * @param key input key
   * @returns the value or undefined
   */
  public getOrUndefined(key: string): string | undefined {
    const value = getInput(key);
    return value !== "" ? value : undefined;
  }

  public getAsCommaSeparatedList(key: string): string[] | undefined {
    // trim the value
    const value: string = (getInput(key) ?? "").trim();
    return value !== "" ? value.replace(/\s/g, "").split(",") : undefined; 
  }

  private getAsBooleanOrDefault(key: string): boolean | undefined {
    const value = getInput(key).trim();
    return value !== "" ? value.toLowerCase() === "true" : undefined;
  }

  readArgs(): Args {
    const configFile = this.getOrUndefined("config-file");

    let args: Args; 
    if (configFile) {
      args = readConfigFile(configFile);
    } else {
      args = {
        dryRun: this.getAsBooleanOrDefault("dry-run"),
        auth: this.getOrUndefined("auth"),
        pullRequest: getInput("pull-request"),
        targetBranch: getInput("target-branch"),
        folder: this.getOrUndefined("folder"),
        gitUser: this.getOrUndefined("git-user"),
        gitEmail: this.getOrUndefined("git-email"),
        title: this.getOrUndefined("title"),
        body: this.getOrUndefined("body"),
        bodyPrefix: this.getOrUndefined("body-prefix"),
        bpBranchName: this.getOrUndefined("bp-branch-name"),
        reviewers: this.getAsCommaSeparatedList("reviewers"),
        assignees: this.getAsCommaSeparatedList("assignees"),
        inheritReviewers: !this.getAsBooleanOrDefault("no-inherit-reviewers"),
      };
    }

    return args;
  }

}