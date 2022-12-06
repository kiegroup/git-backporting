import GitService from "@gb/service/git/git-service";
import { GitServiceType } from "@gb/service/git/git.types";
import GitHubService from "@gb/service/git/github/github-service";

/**
 * Singleton git service factory class
 */
export default class GitServiceFactory {
  
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
      throw new Error("Git service already initialized!");
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