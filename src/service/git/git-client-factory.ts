import GitClient from "@bp/service/git/git-client";
import { GitClientType } from "@bp/service/git/git.types";
import GitHubService from "@bp/service/git/github/github-client";
import LoggerService from "@bp/service/logger/logger-service";
import LoggerServiceFactory from "@bp/service/logger/logger-service-factory";
import GitLabClient from "./gitlab/gitlab-client";

/**
 * Singleton git service factory class
 */
export default class GitClientFactory {
  
  private static logger: LoggerService = LoggerServiceFactory.getLogger();
  private static instance?: GitClient;

  // this method assumes there already exists a singleton client instance, otherwise it will fail
  public static getClient(): GitClient {
    if (!GitClientFactory.instance) {
      throw new Error("You must call `getOrCreate` method first");
    }

    return GitClientFactory.instance;
  }

  /**
   * Initialize the singleton git management service
   * @param type git management service type
   * @param authToken authentication token, like github/gitlab token
   */
  public static getOrCreate(type: GitClientType, authToken: string | undefined, apiUrl: string): GitClient {

    if (GitClientFactory.instance) {
      GitClientFactory.logger.warn("Git service already initialized");
      return GitClientFactory.instance;
    }

    this.logger.debug(`Setting up ${type} client: apiUrl=${apiUrl}, token=****`);

    switch(type) {
      case GitClientType.GITHUB:
        GitClientFactory.instance = new GitHubService(authToken, apiUrl); 
        break;
      case GitClientType.GITLAB:
        GitClientFactory.instance = new GitLabClient(authToken, apiUrl);
        break;
      default:
        throw new Error(`Invalid git service type received: ${type}`);
    }

    return GitClientFactory.instance;
  }

  // this is used for testing purposes
  public static reset(): void {
    GitClientFactory.logger.warn("Resetting git service");
    GitClientFactory.instance = undefined;
  }
}