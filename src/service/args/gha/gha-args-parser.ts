import ArgsParser from "@bp/service/args/args-parser";
import { Args } from "@bp/service/args/args.types";
import { getInput } from "@actions/core";

export default class GHAArgsParser implements ArgsParser {

  /**
   * Return the input only if it is not a blank or null string, otherwise returns undefined
   * @param key input key
   * @returns the value or undefined
   */
  public getOrUndefined(key: string): string | undefined {
    const value = getInput(key);
    return value !== "" ? value : undefined;
  }

  public getOrDefault(key: string, defaultValue: string): string {
    const value = getInput(key);
    return (value !== undefined && value !== "") ? value : defaultValue;
  }

  parse(): Args {
    return {
      dryRun: getInput("dry-run") === "true",
      auth: getInput("auth") ? getInput("auth") : "",
      pullRequest: getInput("pull-request"),
      targetBranch: getInput("target-branch"),
      folder: this.getOrUndefined("folder"),
      gitUser: this.getOrDefault("git-user", "GitHub"),
      gitEmail: this.getOrDefault("git-email", "noreply@github.com"),
      title: this.getOrUndefined("title"),
      body: this.getOrUndefined("body"),
      bodyPrefix: this.getOrUndefined("body-prefix"),
      bpBranchName: this.getOrUndefined("bp-branch-name"),
    };
  }

}