import LoggerService from "@gb/service/logger/logger-service";
import LoggerServiceFactory from "@gb/service/logger/logger-service-factory";
import { Octokit } from "@octokit/rest";

/**
 * Singleton factory class for {Octokit} instance
 */
export default class OctokitFactory {
  
  private static logger: LoggerService = LoggerServiceFactory.getLogger();
  private static octokit?: Octokit;

  public static getOctokit(token: string): Octokit {
    if (!OctokitFactory.octokit) {
      OctokitFactory.logger.info("Creating octokit instance..");
      OctokitFactory.octokit = new Octokit({
        auth: token,
        userAgent: "lampajr/backporting"
      });
    }

    return OctokitFactory.octokit;
  }
}