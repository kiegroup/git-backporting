import { GitPullRequest, GitRepoState, GitRepository } from "@bp/service/git/git.types";

/**
 * Generic git client response mapper
 * 
 * PR - full pull request schema type
 * S  - pull request state type
 */
export default interface GitResponseMapper<PR, S> {

  mapPullRequest(
    pr: PR,
  ): Promise<GitPullRequest>;

  mapGitState(state: S): GitRepoState;

  mapSourceRepo(pull: PR): Promise<GitRepository>;

  mapTargetRepo (pull: PR): Promise<GitRepository>;
}