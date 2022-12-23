import { BackportPullRequest, GitPullRequest } from "@bp/service/git/git.types";

/**
 * Git management service interface, which provides a common API for interacting 
 * with several git management services like GitHub, Gitlab or Bitbucket.
 */
 export default interface GitService {

  // READ

  /**
   * Get a pull request object from the underneath git service
   * @param owner repository's owner
   * @param repo repository's name
   * @param prNumber pull request number
   * @returns {Promise<PullRequest>}
   */
  getPullRequest(owner: string, repo: string, prNumber: number): Promise<GitPullRequest>;

  /**
   * Get a pull request object from the underneath git service
   * @param prUrl pull request html url
   * @returns {Promise<PullRequest>}
   */
   getPullRequestFromUrl(prUrl: string): Promise<GitPullRequest>;

  // WRITE

  /**
   * Create a new pull request on the underneath git service
   * @param backport backport pull request data
   */
  createPullRequest(backport: BackportPullRequest): Promise<void>;
}