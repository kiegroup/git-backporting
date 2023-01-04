import { GitPullRequest } from "@bp/service/git/git.types";
import { PullRequest, User } from "@octokit/webhooks-types";

export default class GitHubMapper {

  mapPullRequest(pr: PullRequest): GitPullRequest {
    return {
      number: pr.number,
      author: pr.user.login,
      url: pr.url,
      htmlUrl: pr.html_url,
      title: pr.title,
      body: pr.body ?? "",
      state: pr.state,
      merged: pr.merged ?? false,
      mergedBy: pr.merged_by?.login,
      reviewers: pr.requested_reviewers.filter(r => "login" in r).map((r => (r as User)?.login)),
      sourceRepo: {
        owner: pr.head.repo.full_name.split("/")[0],
        project: pr.head.repo.full_name.split("/")[1],
        cloneUrl: pr.head.repo.clone_url
      },
      targetRepo: {
        owner: pr.base.repo.full_name.split("/")[0],
        project: pr.base.repo.full_name.split("/")[1],
        cloneUrl: pr.base.repo.clone_url
      },
      nCommits: pr.commits,
      // if pr is open use latest commit sha otherwise use merge_commit_sha
      commits: pr.state === "open" ? [pr.head.sha] : [pr.merge_commit_sha as string]
    };
  }
}