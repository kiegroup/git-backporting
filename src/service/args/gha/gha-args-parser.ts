import ArgsParser from "@bp/service/args/args-parser";
import { Args } from "@bp/service/args/args.types";
import { getInput } from "@actions/core";

export default class GHAArgsParser implements ArgsParser {

  parse(): Args {
    return {
      dryRun: getInput("dry-run") === "true",
      auth: getInput("auth") ? getInput("auth") : "",
      pullRequest: getInput("pull-request"),
      targetBranch: getInput("target-branch"),
      folder: getInput("folder") !== "" ? getInput("folder") : undefined
    };
  }

}