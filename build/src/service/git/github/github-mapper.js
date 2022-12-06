"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class GitHubMapper {
    mapPullRequest(pr) {
        return {
            url: pr.url,
            title: pr.title,
            body: pr.body,
            patchUrl: pr.patch_url,
            state: pr.state,
            reviewers: pr.requested_reviewers.filter(r => "login" in r).map((r => r?.login)),
            sourceRepo: pr.head.repo.full_name,
            targetRepo: pr.base.repo.full_name,
            commits: [pr.merge_commit_sha]
        };
    }
}
exports.default = GitHubMapper;
