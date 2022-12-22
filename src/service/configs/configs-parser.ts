import { Args } from "@bp/service/args/args.types";
import { Configs } from "@bp/service/configs/configs.types";

/**
 * Abstract configuration parser class in charge to parse 
 * Args and produces a common Configs object
 */
 export default abstract class ConfigsParser {

  abstract parse(args: Args): Promise<Configs>;

  async parseAndValidate(args: Args): Promise<Configs> {
    const configs: Configs = await this.parse(args);

    // apply validation, throw errors if something is wrong
    if (configs.originalPullRequest.state == "open" || !configs.originalPullRequest.merged) {
      throw new Error("Provided pull request is not merged!");
    }

    return Promise.resolve(configs);
  }
}