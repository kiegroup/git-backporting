import { BackportPullRequest, GitPullRequest } from "@bp/service/git/git.types";

/**
 * Git management service interface, which provides a common API for interacting 
 * with several git management services like GitHub, Gitlab or Bitbucket.
 */
 export default interface GitClient {

  // READ
  
  getDefaultGitUser(): string;

  getDefaultGitEmail(): string;

  /**
   * Get a pull request object from the underneath git service
   * @param owner repository's owner
   * @param repo repository's name
   * @param prNumber pull request number
   * @param squash if true keep just one single commit, otherwise get the full list
   * @returns {Promise<PullRequest>}
   */
  getPullRequest(owner: string, repo: string, prNumber: number, squash: boolean): Promise<GitPullRequest>;

  /**
   * Get a pull request object from the underneath git service
   * @param prUrl pull request html url
   * @param squash if true keep just one single commit, otherwise get the full list
   * @returns {Promise<PullRequest>}
   */
   getPullRequestFromUrl(prUrl: string, squash: boolean): Promise<GitPullRequest>;

  // WRITE

  /**
   * Create a new pull request on the underneath git service
   * @param backport backport pull request data
   * @returns {Promise<string>} the pull request url
   */
  createPullRequest(backport: BackportPullRequest): Promise<string>;
}