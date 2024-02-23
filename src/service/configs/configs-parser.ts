import { Args } from "@bp/service/args/args.types";
import { Configs } from "@bp/service/configs/configs.types";
import LoggerService from "../logger/logger-service";
import LoggerServiceFactory from "../logger/logger-service-factory";

/**
 * Abstract configuration parser class in charge to parse 
 * Args and produces a common Configs object
 */
 export default abstract class ConfigsParser {
  
  protected readonly logger: LoggerService;

  constructor() {
    this.logger = LoggerServiceFactory.getLogger();
  }

  abstract parse(args: Args): Promise<Configs>;

  async parseAndValidate(args: Args): Promise<Configs> {
    const configs: Configs = await this.parse(args);

    // apply validation, throw errors if something is wrong
    
    // if pr is opened check if the there exists one single commit
    if (configs.originalPullRequest.state == "open") {
      this.logger.warn("Trying to backport an open pull request");
    }

    // if PR is closed and not merged throw an error
    if (configs.originalPullRequest.state == "closed" && !configs.originalPullRequest.merged) {
      throw new Error("Provided pull request is closed and not merged");
    }

    return Promise.resolve(configs);
  }
}