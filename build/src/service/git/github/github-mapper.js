"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class GitHubMapper {
    mapPullRequest(pr) {
        return {
            author: pr.user.login,
            url: pr.url,
            htmlUrl: pr.html_url,
            title: pr.title,
            body: pr.body ?? "",
            state: pr.state,
            merged: pr.merged ?? false,
            mergedBy: pr.merged_by?.login,
            reviewers: pr.requested_reviewers.filter(r => "login" in r).map((r => r?.login)),
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
            commits: [pr.merge_commit_sha]
        };
    }
}
exports.default = GitHubMapper;
