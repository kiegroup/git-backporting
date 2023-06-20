import ArgsParser from "@bp/service/args/args-parser";
import { Args } from "@bp/service/args/args.types";
import { getInput } from "@actions/core";

export default class GHAArgsParser implements ArgsParser {

  /**
   * Return the input only if it is not a blank or null string, otherwise returns undefined
   * @param key input key
   * @returns the value or undefined
   */
  private _getOrUndefined(key: string): string | undefined {
    const value = getInput(key);
    return value !== "" ? value : undefined;
  }

  parse(): Args {
    return {
      dryRun: getInput("dry-run") === "true",
      auth: getInput("auth") ? getInput("auth") : "",
      pullRequest: getInput("pull-request"),
      targetBranch: getInput("target-branch"),
      folder: this._getOrUndefined("folder"),
      title: this._getOrUndefined("title"),
      body: this._getOrUndefined("body"),
      bodyPrefix: this._getOrUndefined("body-prefix"),
      bpBranchName: this._getOrUndefined("bp-branch-name"),
    };
  }

}