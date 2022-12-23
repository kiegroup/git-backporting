import GitService from "@bp/service/git/git-service";
import { GitServiceType } from "@bp/service/git/git.types";
import GitHubService from "@bp/service/git/github/github-service";
import LoggerService from "@bp/service/logger/logger-service";
import LoggerServiceFactory from "@bp/service/logger/logger-service-factory";

/**
 * Singleton git service factory class
 */
export default class GitServiceFactory {
  
  private static logger: LoggerService = LoggerServiceFactory.getLogger();
  private static instance?: GitService;

  public static getService(): GitService {
    if (!GitServiceFactory.instance) {
      throw new Error("You must call `init` method first!");
    }

    return GitServiceFactory.instance;
  }

  /**
   * Initialize the singleton git management service
   * @param type git management service type
   * @param auth authentication, like github token
   */
  public static init(type: GitServiceType, auth: string): void {

    if (GitServiceFactory.instance) {
      GitServiceFactory.logger.warn("Git service already initialized!");
      return;
    }

    switch(type) {
      case GitServiceType.GITHUB:
        GitServiceFactory.instance = new GitHubService(auth);   
        break;
      default:
        throw new Error(`Invalid git service type received: ${type}`);
    }
  }
}