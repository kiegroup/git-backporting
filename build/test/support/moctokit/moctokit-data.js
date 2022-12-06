"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validPR = exports.commitRef = exports.invalidPullRequestNumber = exports.pullRequestNumber = exports.repo = exports.sourceOwner = exports.targetOwner = void 0;
exports.targetOwner = "owner";
exports.sourceOwner = "fork";
exports.repo = "reponame";
exports.pullRequestNumber = 2368;
exports.invalidPullRequestNumber = 1;
exports.commitRef = "91748965051fae1330ad58d15cf694e103267c87";
exports.validPR = {
    "url": "https://api.github.com/repos/owner/reponame/pulls/2368",
    "id": 1137188271,
    "node_id": "PR_kwDOABTq6s5DyB2v",
    "html_url": "https://github.com/owner/reponame/pull/2368",
    "diff_url": "https://github.com/owner/reponame/pull/2368.diff",
    "patch_url": "https://github.com/owner/reponame/pull/2368.patch",
    "issue_url": "https://api.github.com/repos/owner/reponame/issues/2368",
    "number": 2368,
    "state": "closed",
    "locked": false,
    "title": "PR Title",
    "user": {
        "login": "kie-ci",
        "id": 11995863,
        "node_id": "MDQ6VXNlcjExOTk1ODYz",
        "avatar_url": "https://avatars.githubusercontent.com/u/11995863?v=4",
        "gravatar_id": "",
        "url": "https://api.github.com/users/kie-ci",
        "html_url": "https://github.com/kie-ci",
        "followers_url": "https://api.github.com/users/kie-ci/followers",
        "following_url": "https://api.github.com/users/kie-ci/following{/other_user}",
        "gists_url": "https://api.github.com/users/kie-ci/gists{/gist_id}",
        "starred_url": "https://api.github.com/users/kie-ci/starred{/owner}{/repo}",
        "subscriptions_url": "https://api.github.com/users/kie-ci/subscriptions",
        "organizations_url": "https://api.github.com/users/kie-ci/orgs",
        "repos_url": "https://api.github.com/users/kie-ci/repos",
        "events_url": "https://api.github.com/users/kie-ci/events{/privacy}",
        "received_events_url": "https://api.github.com/users/kie-ci/received_events",
        "type": "User",
        "site_admin": false
    },
    "body": "Please review and merge",
    "created_at": "2022-11-28T08:43:09Z",
    "updated_at": "2022-11-28T10:11:53Z",
    "closed_at": "2022-11-28T10:11:52Z",
    "merged_at": "2022-11-28T10:11:52Z",
    "merge_commit_sha": "28f63db774185f4ec4b57cd9aaeb12dbfb4c9ecc",
    "assignee": null,
    "assignees": [],
    "requested_reviewers": [
        {
            "login": "ghuser",
            "id": 1422582,
            "node_id": "MDQ6VXNlcjE0MjI1ODI=",
            "avatar_url": "https://avatars.githubusercontent.com/u/1422582?v=4",
            "gravatar_id": "",
            "url": "https://api.github.com/users/ghuser",
            "html_url": "https://github.com/ghuser",
            "followers_url": "https://api.github.com/users/ghuser/followers",
            "following_url": "https://api.github.com/users/ghuser/following{/other_user}",
            "gists_url": "https://api.github.com/users/ghuser/gists{/gist_id}",
            "starred_url": "https://api.github.com/users/ghuser/starred{/owner}{/repo}",
            "subscriptions_url": "https://api.github.com/users/ghuser/subscriptions",
            "organizations_url": "https://api.github.com/users/ghuser/orgs",
            "repos_url": "https://api.github.com/users/ghuser/repos",
            "events_url": "https://api.github.com/users/ghuser/events{/privacy}",
            "received_events_url": "https://api.github.com/users/ghuser/received_events",
            "type": "User",
            "site_admin": false
        }
    ],
    "requested_teams": [],
    "labels": [],
    "milestone": null,
    "draft": false,
    "commits_url": "https://api.github.com/repos/owner/reponame/pulls/2368/commits",
    "review_comments_url": "https://api.github.com/repos/owner/reponame/pulls/2368/comments",
    "review_comment_url": "https://api.github.com/repos/owner/reponame/pulls/comments{/number}",
    "comments_url": "https://api.github.com/repos/owner/reponame/issues/2368/comments",
    "statuses_url": "https://api.github.com/repos/owner/reponame/statuses/91748965051fae1330ad58d15cf694e103267c87",
    "head": {
        "label": "kiegroup:bump-8.31.x-drools-8.31.0.Final",
        "ref": "bump-8.31.x-drools-8.31.0.Final",
        "sha": "91748965051fae1330ad58d15cf694e103267c87",
        "user": {
            "login": "kiegroup",
            "id": 517980,
            "node_id": "MDEyOk9yZ2FuaXphdGlvbjUxNzk4MA==",
            "avatar_url": "https://avatars.githubusercontent.com/u/517980?v=4",
            "gravatar_id": "",
            "url": "https://api.github.com/users/kiegroup",
            "html_url": "https://github.com/kiegroup",
            "followers_url": "https://api.github.com/users/kiegroup/followers",
            "following_url": "https://api.github.com/users/kiegroup/following{/other_user}",
            "gists_url": "https://api.github.com/users/kiegroup/gists{/gist_id}",
            "starred_url": "https://api.github.com/users/kiegroup/starred{/owner}{/repo}",
            "subscriptions_url": "https://api.github.com/users/kiegroup/subscriptions",
            "organizations_url": "https://api.github.com/users/kiegroup/orgs",
            "repos_url": "https://api.github.com/users/kiegroup/repos",
            "events_url": "https://api.github.com/users/kiegroup/events{/privacy}",
            "received_events_url": "https://api.github.com/users/kiegroup/received_events",
            "type": "Organization",
            "site_admin": false
        },
        "repo": {
            "id": 1370858,
            "node_id": "MDEwOlJlcG9zaXRvcnkxMzcwODU4",
            "name": "optaplanner",
            "full_name": "fork/reponame",
            "private": false,
            "owner": {
                "login": "kiegroup",
                "id": 517980,
                "node_id": "MDEyOk9yZ2FuaXphdGlvbjUxNzk4MA==",
                "avatar_url": "https://avatars.githubusercontent.com/u/517980?v=4",
                "gravatar_id": "",
                "url": "https://api.github.com/users/kiegroup",
                "html_url": "https://github.com/kiegroup",
                "followers_url": "https://api.github.com/users/kiegroup/followers",
                "following_url": "https://api.github.com/users/kiegroup/following{/other_user}",
                "gists_url": "https://api.github.com/users/kiegroup/gists{/gist_id}",
                "starred_url": "https://api.github.com/users/kiegroup/starred{/owner}{/repo}",
                "subscriptions_url": "https://api.github.com/users/kiegroup/subscriptions",
                "organizations_url": "https://api.github.com/users/kiegroup/orgs",
                "repos_url": "https://api.github.com/users/kiegroup/repos",
                "events_url": "https://api.github.com/users/kiegroup/events{/privacy}",
                "received_events_url": "https://api.github.com/users/kiegroup/received_events",
                "type": "Organization",
                "site_admin": false
            },
            "html_url": "https://github.com/fork/reponame",
            "description": "AI constraint solver in Java to optimize the vehicle routing problem, employee rostering, task assignment, maintenance scheduling, conference scheduling and other planning problems.",
            "fork": false,
            "url": "https://api.github.com/repos/fork/reponame",
            "forks_url": "https://api.github.com/repos/fork/reponame/forks",
            "keys_url": "https://api.github.com/repos/fork/reponame/keys{/key_id}",
            "collaborators_url": "https://api.github.com/repos/fork/reponame/collaborators{/collaborator}",
            "teams_url": "https://api.github.com/repos/fork/reponame/teams",
            "hooks_url": "https://api.github.com/repos/fork/reponame/hooks",
            "issue_events_url": "https://api.github.com/repos/fork/reponame/issues/events{/number}",
            "events_url": "https://api.github.com/repos/fork/reponame/events",
            "assignees_url": "https://api.github.com/repos/fork/reponame/assignees{/user}",
            "branches_url": "https://api.github.com/repos/fork/reponame/branches{/branch}",
            "tags_url": "https://api.github.com/repos/fork/reponame/tags",
            "blobs_url": "https://api.github.com/repos/fork/reponame/git/blobs{/sha}",
            "git_tags_url": "https://api.github.com/repos/fork/reponame/git/tags{/sha}",
            "git_refs_url": "https://api.github.com/repos/fork/reponame/git/refs{/sha}",
            "trees_url": "https://api.github.com/repos/fork/reponame/git/trees{/sha}",
            "statuses_url": "https://api.github.com/repos/fork/reponame/statuses/{sha}",
            "languages_url": "https://api.github.com/repos/fork/reponame/languages",
            "stargazers_url": "https://api.github.com/repos/fork/reponame/stargazers",
            "contributors_url": "https://api.github.com/repos/fork/reponame/contributors",
            "subscribers_url": "https://api.github.com/repos/fork/reponame/subscribers",
            "subscription_url": "https://api.github.com/repos/fork/reponame/subscription",
            "commits_url": "https://api.github.com/repos/fork/reponame/commits{/sha}",
            "git_commits_url": "https://api.github.com/repos/fork/reponame/git/commits{/sha}",
            "comments_url": "https://api.github.com/repos/fork/reponame/comments{/number}",
            "issue_comment_url": "https://api.github.com/repos/fork/reponame/issues/comments{/number}",
            "contents_url": "https://api.github.com/repos/fork/reponame/contents/{+path}",
            "compare_url": "https://api.github.com/repos/fork/reponame/compare/{base}...{head}",
            "merges_url": "https://api.github.com/repos/fork/reponame/merges",
            "archive_url": "https://api.github.com/repos/fork/reponame/{archive_format}{/ref}",
            "downloads_url": "https://api.github.com/repos/fork/reponame/downloads",
            "issues_url": "https://api.github.com/repos/fork/reponame/issues{/number}",
            "pulls_url": "https://api.github.com/repos/fork/reponame/pulls{/number}",
            "milestones_url": "https://api.github.com/repos/fork/reponame/milestones{/number}",
            "notifications_url": "https://api.github.com/repos/fork/reponame/notifications{?since,all,participating}",
            "labels_url": "https://api.github.com/repos/fork/reponame/labels{/name}",
            "releases_url": "https://api.github.com/repos/fork/reponame/releases{/id}",
            "deployments_url": "https://api.github.com/repos/fork/reponame/deployments",
            "created_at": "2011-02-15T19:38:23Z",
            "updated_at": "2022-11-28T05:01:47Z",
            "pushed_at": "2022-11-28T10:50:51Z",
            "git_url": "git://github.com/fork/reponame.git",
            "ssh_url": "git@github.com:fork/reponame.git",
            "clone_url": "https://github.com/fork/reponame.git",
            "svn_url": "https://github.com/fork/reponame",
            "homepage": "https://www.optaplanner.org",
            "size": 238339,
            "stargazers_count": 2811,
            "watchers_count": 2811,
            "language": "Java",
            "has_issues": false,
            "has_projects": false,
            "has_downloads": true,
            "has_wiki": false,
            "has_pages": false,
            "has_discussions": false,
            "forks_count": 878,
            "mirror_url": null,
            "archived": false,
            "disabled": false,
            "open_issues_count": 30,
            "license": {
                "key": "apache-2.0",
                "name": "Apache License 2.0",
                "spdx_id": "Apache-2.0",
                "url": "https://api.github.com/licenses/apache-2.0",
                "node_id": "MDc6TGljZW5zZTI="
            },
            "allow_forking": true,
            "is_template": false,
            "web_commit_signoff_required": false,
            "topics": [
                "artificial-intelligence",
                "branch-and-bound",
                "constraint-programming",
                "constraint-satisfaction-problem",
                "constraint-solver",
                "constraints",
                "employee-rostering",
                "java",
                "local-search",
                "mathematical-optimization",
                "metaheuristics",
                "optimization",
                "rostering",
                "scheduling",
                "simulated-annealing",
                "solver",
                "tabu-search",
                "traveling-salesman",
                "traveling-salesman-problem",
                "vehicle-routing-problem"
            ],
            "visibility": "public",
            "forks": 878,
            "open_issues": 30,
            "watchers": 2811,
            "default_branch": "main"
        }
    },
    "base": {
        "label": "kiegroup:8.31.x",
        "ref": "8.31.x",
        "sha": "8cfc286765cb01c84a1d62c65519fa8032bfecbd",
        "user": {
            "login": "kiegroup",
            "id": 517980,
            "node_id": "MDEyOk9yZ2FuaXphdGlvbjUxNzk4MA==",
            "avatar_url": "https://avatars.githubusercontent.com/u/517980?v=4",
            "gravatar_id": "",
            "url": "https://api.github.com/users/kiegroup",
            "html_url": "https://github.com/kiegroup",
            "followers_url": "https://api.github.com/users/kiegroup/followers",
            "following_url": "https://api.github.com/users/kiegroup/following{/other_user}",
            "gists_url": "https://api.github.com/users/kiegroup/gists{/gist_id}",
            "starred_url": "https://api.github.com/users/kiegroup/starred{/owner}{/repo}",
            "subscriptions_url": "https://api.github.com/users/kiegroup/subscriptions",
            "organizations_url": "https://api.github.com/users/kiegroup/orgs",
            "repos_url": "https://api.github.com/users/kiegroup/repos",
            "events_url": "https://api.github.com/users/kiegroup/events{/privacy}",
            "received_events_url": "https://api.github.com/users/kiegroup/received_events",
            "type": "Organization",
            "site_admin": false
        },
        "repo": {
            "id": 1370858,
            "node_id": "MDEwOlJlcG9zaXRvcnkxMzcwODU4",
            "name": "optaplanner",
            "full_name": "owner/reponame",
            "private": false,
            "owner": {
                "login": "kiegroup",
                "id": 517980,
                "node_id": "MDEyOk9yZ2FuaXphdGlvbjUxNzk4MA==",
                "avatar_url": "https://avatars.githubusercontent.com/u/517980?v=4",
                "gravatar_id": "",
                "url": "https://api.github.com/users/kiegroup",
                "html_url": "https://github.com/kiegroup",
                "followers_url": "https://api.github.com/users/kiegroup/followers",
                "following_url": "https://api.github.com/users/kiegroup/following{/other_user}",
                "gists_url": "https://api.github.com/users/kiegroup/gists{/gist_id}",
                "starred_url": "https://api.github.com/users/kiegroup/starred{/owner}{/repo}",
                "subscriptions_url": "https://api.github.com/users/kiegroup/subscriptions",
                "organizations_url": "https://api.github.com/users/kiegroup/orgs",
                "repos_url": "https://api.github.com/users/kiegroup/repos",
                "events_url": "https://api.github.com/users/kiegroup/events{/privacy}",
                "received_events_url": "https://api.github.com/users/kiegroup/received_events",
                "type": "Organization",
                "site_admin": false
            },
            "html_url": "https://github.com/owner/reponame",
            "description": "AI constraint solver in Java to optimize the vehicle routing problem, employee rostering, task assignment, maintenance scheduling, conference scheduling and other planning problems.",
            "fork": false,
            "url": "https://api.github.com/repos/owner/reponame",
            "forks_url": "https://api.github.com/repos/owner/reponame/forks",
            "keys_url": "https://api.github.com/repos/owner/reponame/keys{/key_id}",
            "collaborators_url": "https://api.github.com/repos/owner/reponame/collaborators{/collaborator}",
            "teams_url": "https://api.github.com/repos/owner/reponame/teams",
            "hooks_url": "https://api.github.com/repos/owner/reponame/hooks",
            "issue_events_url": "https://api.github.com/repos/owner/reponame/issues/events{/number}",
            "events_url": "https://api.github.com/repos/owner/reponame/events",
            "assignees_url": "https://api.github.com/repos/owner/reponame/assignees{/user}",
            "branches_url": "https://api.github.com/repos/owner/reponame/branches{/branch}",
            "tags_url": "https://api.github.com/repos/owner/reponame/tags",
            "blobs_url": "https://api.github.com/repos/owner/reponame/git/blobs{/sha}",
            "git_tags_url": "https://api.github.com/repos/owner/reponame/git/tags{/sha}",
            "git_refs_url": "https://api.github.com/repos/owner/reponame/git/refs{/sha}",
            "trees_url": "https://api.github.com/repos/owner/reponame/git/trees{/sha}",
            "statuses_url": "https://api.github.com/repos/owner/reponame/statuses/{sha}",
            "languages_url": "https://api.github.com/repos/owner/reponame/languages",
            "stargazers_url": "https://api.github.com/repos/owner/reponame/stargazers",
            "contributors_url": "https://api.github.com/repos/owner/reponame/contributors",
            "subscribers_url": "https://api.github.com/repos/owner/reponame/subscribers",
            "subscription_url": "https://api.github.com/repos/owner/reponame/subscription",
            "commits_url": "https://api.github.com/repos/owner/reponame/commits{/sha}",
            "git_commits_url": "https://api.github.com/repos/owner/reponame/git/commits{/sha}",
            "comments_url": "https://api.github.com/repos/owner/reponame/comments{/number}",
            "issue_comment_url": "https://api.github.com/repos/owner/reponame/issues/comments{/number}",
            "contents_url": "https://api.github.com/repos/owner/reponame/contents/{+path}",
            "compare_url": "https://api.github.com/repos/owner/reponame/compare/{base}...{head}",
            "merges_url": "https://api.github.com/repos/owner/reponame/merges",
            "archive_url": "https://api.github.com/repos/owner/reponame/{archive_format}{/ref}",
            "downloads_url": "https://api.github.com/repos/owner/reponame/downloads",
            "issues_url": "https://api.github.com/repos/owner/reponame/issues{/number}",
            "pulls_url": "https://api.github.com/repos/owner/reponame/pulls{/number}",
            "milestones_url": "https://api.github.com/repos/owner/reponame/milestones{/number}",
            "notifications_url": "https://api.github.com/repos/owner/reponame/notifications{?since,all,participating}",
            "labels_url": "https://api.github.com/repos/owner/reponame/labels{/name}",
            "releases_url": "https://api.github.com/repos/owner/reponame/releases{/id}",
            "deployments_url": "https://api.github.com/repos/owner/reponame/deployments",
            "created_at": "2011-02-15T19:38:23Z",
            "updated_at": "2022-11-28T05:01:47Z",
            "pushed_at": "2022-11-28T10:50:51Z",
            "git_url": "git://github.com/owner/reponame.git",
            "ssh_url": "git@github.com:owner/reponame.git",
            "clone_url": "https://github.com/owner/reponame.git",
            "svn_url": "https://github.com/owner/reponame",
            "homepage": "https://www.optaplanner.org",
            "size": 238339,
            "stargazers_count": 2811,
            "watchers_count": 2811,
            "language": "Java",
            "has_issues": false,
            "has_projects": false,
            "has_downloads": true,
            "has_wiki": false,
            "has_pages": false,
            "has_discussions": false,
            "forks_count": 878,
            "mirror_url": null,
            "archived": false,
            "disabled": false,
            "open_issues_count": 30,
            "license": {
                "key": "apache-2.0",
                "name": "Apache License 2.0",
                "spdx_id": "Apache-2.0",
                "url": "https://api.github.com/licenses/apache-2.0",
                "node_id": "MDc6TGljZW5zZTI="
            },
            "allow_forking": true,
            "is_template": false,
            "web_commit_signoff_required": false,
            "topics": [
                "artificial-intelligence",
                "branch-and-bound",
                "constraint-programming",
                "constraint-satisfaction-problem",
                "constraint-solver",
                "constraints",
                "employee-rostering",
                "java",
                "local-search",
                "mathematical-optimization",
                "metaheuristics",
                "optimization",
                "rostering",
                "scheduling",
                "simulated-annealing",
                "solver",
                "tabu-search",
                "traveling-salesman",
                "traveling-salesman-problem",
                "vehicle-routing-problem"
            ],
            "visibility": "public",
            "forks": 878,
            "open_issues": 30,
            "watchers": 2811,
            "default_branch": "main"
        }
    },
    "_links": {
        "self": {
            "href": "https://api.github.com/repos/owner/reponame/pulls/2368"
        },
        "html": {
            "href": "https://github.com/owner/reponame/pull/2368"
        },
        "issue": {
            "href": "https://api.github.com/repos/owner/reponame/issues/2368"
        },
        "comments": {
            "href": "https://api.github.com/repos/owner/reponame/issues/2368/comments"
        },
        "review_comments": {
            "href": "https://api.github.com/repos/owner/reponame/pulls/2368/comments"
        },
        "review_comment": {
            "href": "https://api.github.com/repos/owner/reponame/pulls/comments{/number}"
        },
        "commits": {
            "href": "https://api.github.com/repos/owner/reponame/pulls/2368/commits"
        },
        "statuses": {
            "href": "https://api.github.com/repos/owner/reponame/statuses/91748965051fae1330ad58d15cf694e103267c87"
        }
    },
    "author_association": "CONTRIBUTOR",
    "auto_merge": null,
    "active_lock_reason": null,
    "merged": true,
    "mergeable": null,
    "rebaseable": null,
    "mergeable_state": "unknown",
    "merged_by": {
        "login": "radtriste",
        "id": 17157711,
        "node_id": "MDQ6VXNlcjE3MTU3NzEx",
        "avatar_url": "https://avatars.githubusercontent.com/u/17157711?v=4",
        "gravatar_id": "",
        "url": "https://api.github.com/users/radtriste",
        "html_url": "https://github.com/radtriste",
        "followers_url": "https://api.github.com/users/radtriste/followers",
        "following_url": "https://api.github.com/users/radtriste/following{/other_user}",
        "gists_url": "https://api.github.com/users/radtriste/gists{/gist_id}",
        "starred_url": "https://api.github.com/users/radtriste/starred{/owner}{/repo}",
        "subscriptions_url": "https://api.github.com/users/radtriste/subscriptions",
        "organizations_url": "https://api.github.com/users/radtriste/orgs",
        "repos_url": "https://api.github.com/users/radtriste/repos",
        "events_url": "https://api.github.com/users/radtriste/events{/privacy}",
        "received_events_url": "https://api.github.com/users/radtriste/received_events",
        "type": "User",
        "site_admin": false
    },
    "comments": 0,
    "review_comments": 0,
    "maintainer_can_modify": false,
    "commits": 2,
    "additions": 2,
    "deletions": 2,
    "changed_files": 2
};
