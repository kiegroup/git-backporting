import { GitPullRequest } from "@gb/service/git/git.types";
import { PullRequest, User } from "@octokit/webhooks-types";

export default class GitHubMapper {

  mapPullRequest(pr: PullRequest): GitPullRequest {
    return {
      url: pr.url,
      title: pr.title,
      body: pr.body,
      patchUrl: pr.patch_url,
      state: pr.state,
      reviewers: pr.requested_reviewers.filter(r => "login" in r).map((r => (r as User)?.login)),
      sourceRepo: pr.head.repo.full_name,
      targetRepo: pr.base.repo.full_name,
      commits: [pr.merge_commit_sha]
    } as GitPullRequest;
  }
}