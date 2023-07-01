import { GitPullRequest, GitRepoState, GitRepository } from "@bp/service/git/git.types";
import { PullRequest, User } from "@octokit/webhooks-types";
import GitResponseMapper from "@bp/service/git/git-mapper";

export default class GitHubMapper implements GitResponseMapper<PullRequest, "open" | "closed"> {

  mapGitState(state: "open" | "closed"): GitRepoState {
    switch (state) {
      case "open":
        return GitRepoState.OPEN;
      default:
        return GitRepoState.CLOSED;
    }
  }

  async mapPullRequest(pr: PullRequest): Promise<GitPullRequest> {
    return {
      number: pr.number,
      author: pr.user.login,
      url: pr.url,
      htmlUrl: pr.html_url,
      title: pr.title,
      body: pr.body ?? "",
      state: this.mapGitState(pr.state), // TODO fix using custom mapper
      merged: pr.merged ?? false,
      mergedBy: pr.merged_by?.login,
      reviewers: pr.requested_reviewers.filter(r => "login" in r).map((r => (r as User)?.login)),
      assignees: pr.assignees.filter(r => "login" in r).map(r => r.login),
      sourceRepo: await this.mapSourceRepo(pr),
      targetRepo: await this.mapTargetRepo(pr),
      nCommits: pr.commits,
      // if pr is open use latest commit sha otherwise use merge_commit_sha
      commits: pr.state === "open" ? [pr.head.sha] : [pr.merge_commit_sha as string]
    };
  }

  async mapSourceRepo(pr: PullRequest): Promise<GitRepository> {
    return Promise.resolve({
      owner: pr.head.repo.full_name.split("/")[0],
      project: pr.head.repo.full_name.split("/")[1],
      cloneUrl: pr.head.repo.clone_url
    });
  }

  async mapTargetRepo(pr: PullRequest): Promise<GitRepository> {
    return Promise.resolve({
      owner: pr.base.repo.full_name.split("/")[0],
      project: pr.base.repo.full_name.split("/")[1],
      cloneUrl: pr.base.repo.clone_url
    });
  }
}