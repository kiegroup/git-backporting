import { GitPullRequest } from "@gb/service/git/git.types";

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

  // WRITE

  /**
   * Create a new pull request on the underneath git service
   * @param owner repository's owner
   * @param repo repository's name
   * @param head name of the source branch
   * @param base name of the target branch
   * @param title pr title
   * @param body  pr body
   * @param reviewers pr list of reviewers
   */
  createPullRequest(owner: string, repo: string, head: string, base: string, title: string, body: string, reviewers: string[]): Promise<void>;
}