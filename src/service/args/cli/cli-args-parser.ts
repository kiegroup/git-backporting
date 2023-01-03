import ArgsParser from "@bp/service/args/args-parser";
import { Args } from "@bp/service/args/args.types";
import { Command } from "commander";
import { name, version, description } from "@bp/../package.json";


export default class CLIArgsParser implements ArgsParser {

  private getCommand(): Command {
    return new Command(name)
      .version(version)
      .description(description)
      .requiredOption("-tb, --target-branch <branch>", "branch where changes must be backported to.")
      .requiredOption("-pr, --pull-request <pr url>", "pull request url, e.g., https://github.com/lampajr/backporting/pull/1.")
      .option("-d, --dry-run", "if enabled the tool does not create any pull request nor push anything remotely", false)
      .option("-a, --auth <auth>", "git service authentication string, e.g., github token.", "")
      .option("-f, --folder <folder>", "local folder where the repo will be checked out, e.g., /tmp/folder.", undefined);
  }

  parse(): Args {
    const opts = this.getCommand()
      .parse()
      .opts();
    
    return {
      dryRun: opts.dryRun,
      auth: opts.auth,
      pullRequest: opts.pullRequest,
      targetBranch: opts.targetBranch,
      folder: opts.folder
    };
  }

}