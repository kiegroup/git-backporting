// <host>/api/v4/projects/superuser%2Fbackporting-example/merge_requests/1
// <host>/api/v4/projects/76316

export const PROJECT_EXAMPLE = {
  "id":76316,
  "description":null,
  "name":"Backporting Example",
  "name_with_namespace":"Super User / Backporting Example",
  "path":"backporting-example",
  "path_with_namespace":"superuser/backporting-example",
  "created_at":"2023-06-23T13:45:15.121Z",
  "default_branch":"main",
  "tag_list":[
     
  ],
  "topics":[
     
  ],
  "ssh_url_to_repo":"git@my.gitlab.host.com:superuser/backporting-example.git",
  "http_url_to_repo":"https://my.gitlab.host.com/superuser/backporting-example.git",
  "web_url":"https://my.gitlab.host.com/superuser/backporting-example",
  "readme_url":"https://my.gitlab.host.com/superuser/backporting-example/-/blob/main/README.md",
  "forks_count":0,
  "avatar_url":null,
  "star_count":0,
  "last_activity_at":"2023-06-28T14:05:42.596Z",
  "namespace":{
     "id":70747,
     "name":"Super User",
     "path":"superuser",
     "kind":"user",
     "full_path":"superuser",
     "parent_id":null,
     "avatar_url":"/uploads/-/system/user/avatar/14041/avatar.png",
     "web_url":"https://my.gitlab.host.com/superuser"
  },
  "_links":{
     "self":"https://my.gitlab.host.com/api/v4/projects/76316",
     "issues":"https://my.gitlab.host.com/api/v4/projects/76316/issues",
     "merge_requests":"https://my.gitlab.host.com/api/v4/projects/76316/merge_requests",
     "repo_branches":"https://my.gitlab.host.com/api/v4/projects/76316/repository/branches",
     "labels":"https://my.gitlab.host.com/api/v4/projects/76316/labels",
     "events":"https://my.gitlab.host.com/api/v4/projects/76316/events",
     "members":"https://my.gitlab.host.com/api/v4/projects/76316/members",
     "cluster_agents":"https://my.gitlab.host.com/api/v4/projects/76316/cluster_agents"
  },
  "packages_enabled":true,
  "empty_repo":false,
  "archived":false,
  "visibility":"private",
  "owner":{
     "id":14041,
     "username":"superuser",
     "name":"Super User",
     "state":"active",
     "avatar_url":"https://my.gitlab.host.com/uploads/-/system/user/avatar/14041/avatar.png",
     "web_url":"https://my.gitlab.host.com/superuser"
  },
  "resolve_outdated_diff_discussions":false,
  "container_expiration_policy":{
     "cadence":"1d",
     "enabled":false,
     "keep_n":10,
     "older_than":"90d",
     "name_regex":".*",
     "name_regex_keep":null,
     "next_run_at":"2023-06-24T13:45:15.167Z"
  },
  "issues_enabled":true,
  "merge_requests_enabled":true,
  "wiki_enabled":true,
  "jobs_enabled":true,
  "snippets_enabled":true,
  "container_registry_enabled":true,
  "service_desk_enabled":false,
  "service_desk_address":null,
  "can_create_merge_request_in":true,
  "issues_access_level":"enabled",
  "repository_access_level":"enabled",
  "merge_requests_access_level":"enabled",
  "forking_access_level":"enabled",
  "wiki_access_level":"enabled",
  "builds_access_level":"enabled",
  "snippets_access_level":"enabled",
  "pages_access_level":"private",
  "analytics_access_level":"enabled",
  "container_registry_access_level":"enabled",
  "security_and_compliance_access_level":"private",
  "releases_access_level":"enabled",
  "environments_access_level":"enabled",
  "feature_flags_access_level":"enabled",
  "infrastructure_access_level":"enabled",
  "monitor_access_level":"enabled",
  "emails_disabled":null,
  "shared_runners_enabled":true,
  "lfs_enabled":true,
  "creator_id":14041,
  "import_url":null,
  "import_type":null,
  "import_status":"none",
  "import_error":null,
  "open_issues_count":0,
  "description_html":"",
  "updated_at":"2023-06-28T14:05:42.596Z",
  "ci_default_git_depth":20,
  "ci_forward_deployment_enabled":true,
  "ci_job_token_scope_enabled":false,
  "ci_separated_caches":true,
  "ci_allow_fork_pipelines_to_run_in_parent_project":true,
  "build_git_strategy":"fetch",
  "keep_latest_artifact":true,
  "restrict_user_defined_variables":false,
  "runners_token":"TOKEN",
  "runner_token_expiration_interval":null,
  "group_runners_enabled":true,
  "auto_cancel_pending_pipelines":"enabled",
  "build_timeout":3600,
  "auto_devops_enabled":false,
  "auto_devops_deploy_strategy":"continuous",
  "ci_config_path":"",
  "public_jobs":true,
  "shared_with_groups":[
     
  ],
  "only_allow_merge_if_pipeline_succeeds":false,
  "allow_merge_on_skipped_pipeline":null,
  "request_access_enabled":true,
  "only_allow_merge_if_all_discussions_are_resolved":false,
  "remove_source_branch_after_merge":true,
  "printing_merge_request_link_enabled":true,
  "merge_method":"merge",
  "squash_option":"default_off",
  "enforce_auth_checks_on_uploads":true,
  "suggestion_commit_message":null,
  "merge_commit_template":null,
  "squash_commit_template":null,
  "issue_branch_template":null,
  "autoclose_referenced_issues":true,
  "approvals_before_merge":0,
  "mirror":false,
  "external_authorization_classification_label":null,
  "marked_for_deletion_at":null,
  "marked_for_deletion_on":null,
  "requirements_enabled":false,
  "requirements_access_level":"enabled",
  "security_and_compliance_enabled":true,
  "compliance_frameworks":[
     
  ],
  "issues_template":null,
  "merge_requests_template":null,
  "merge_pipelines_enabled":false,
  "merge_trains_enabled":false,
  "allow_pipeline_trigger_approve_deployment":false,
  "permissions":{
     "project_access":{
        "access_level":50,
        "notification_level":3
     },
     "group_access":null
  }
};

export const MERGED_SQUASHED_MR = {
  "id":807106,
  "iid":1,
  "project_id":76316,
  "title":"Update test.txt",
  "description":"This is the body",
  "state":"merged",
  "created_at":"2023-06-28T14:32:40.943Z",
  "updated_at":"2023-06-28T14:37:12.108Z",
  "merged_by":{
     "id":14041,
     "username":"superuser",
     "name":"Super User",
     "state":"active",
     "avatar_url":"https://my.gitlab.host.com/uploads/-/system/user/avatar/14041/avatar.png",
     "web_url":"https://my.gitlab.host.com/superuser"
  },
  "merge_user":{
     "id":14041,
     "username":"superuser",
     "name":"Super User",
     "state":"active",
     "avatar_url":"https://my.gitlab.host.com/uploads/-/system/user/avatar/14041/avatar.png",
     "web_url":"https://my.gitlab.host.com/superuser"
  },
  "merged_at":"2023-06-28T14:37:11.667Z",
  "closed_by":null,
  "closed_at":null,
  "target_branch":"main",
  "source_branch":"feature",
  "user_notes_count":0,
  "upvotes":0,
  "downvotes":0,
  "author":{
     "id":14041,
     "username":"superuser",
     "name":"Super User",
     "state":"active",
     "avatar_url":"https://my.gitlab.host.com/uploads/-/system/user/avatar/14041/avatar.png",
     "web_url":"https://my.gitlab.host.com/superuser"
  },
  "assignees":[
     {
        "id":14041,
        "username":"superuser",
        "name":"Super User",
        "state":"active",
        "avatar_url":"https://my.gitlab.host.com/uploads/-/system/user/avatar/14041/avatar.png",
        "web_url":"https://my.gitlab.host.com/superuser"
     }
  ],
  "assignee":{
     "id":14041,
     "username":"superuser",
     "name":"Super User",
     "state":"active",
     "avatar_url":"https://my.gitlab.host.com/uploads/-/system/user/avatar/14041/avatar.png",
     "web_url":"https://my.gitlab.host.com/superuser"
  },
  "reviewers":[
     {
        "id":1404188,
        "username":"superuser1",
        "name":"Super User",
        "state":"active",
        "avatar_url":"https://my.gitlab.host.com/uploads/-/system/user/avatar/14041/avatar.png",
        "web_url":"https://my.gitlab.host.com/superuser"
     },
     {
        "id":1404199,
        "username":"superuser2",
        "name":"Super User",
        "state":"active",
        "avatar_url":"https://my.gitlab.host.com/uploads/-/system/user/avatar/14041/avatar.png",
        "web_url":"https://my.gitlab.host.com/superuser"
     }
  ],
  "source_project_id":76316,
  "target_project_id":76316,
  "labels":[
     "gitlab-original-label"
  ],
  "draft":false,
  "work_in_progress":false,
  "milestone":null,
  "merge_when_pipeline_succeeds":false,
  "merge_status":"can_be_merged",
  "detailed_merge_status":"not_open",
  "sha":"9e15674ebd48e05c6e428a1fa31dbb60a778d644",
  "merge_commit_sha":"4d369c3e9a8d1d5b7e56c892a8ab2a7666583ac3",
  "squash_commit_sha":"ebb1eca696c42fd067658bd9b5267709f78ef38e",
  "discussion_locked":null,
  "should_remove_source_branch":true,
  "force_remove_source_branch":true,
  "reference":"!2",
  "references":{
     "short":"!2",
     "relative":"!2",
     "full":"superuser/backporting-example!2"
  },
  "web_url":"https://my.gitlab.host.com/superuser/backporting-example/-/merge_requests/1",
  "time_stats":{
     "time_estimate":0,
     "total_time_spent":0,
     "human_time_estimate":null,
     "human_total_time_spent":null
  },
  "squash":true,
  "squash_on_merge":true,
  "task_completion_status":{
     "count":0,
     "completed_count":0
  },
  "has_conflicts":false,
  "blocking_discussions_resolved":true,
  "approvals_before_merge":null,
  "subscribed":true,
  "changes_count":"1",
  "latest_build_started_at":null,
  "latest_build_finished_at":null,
  "first_deployed_to_production_at":null,
  "pipeline":null,
  "head_pipeline":null,
  "diff_refs":{
     "base_sha":"2c553a0c4c133a51806badce5fa4842b7253cb3b",
     "head_sha":"9e15674ebd48e05c6e428a1fa31dbb60a778d644",
     "start_sha":"2c553a0c4c133a51806badce5fa4842b7253cb3b"
  },
  "merge_error":null,
  "first_contribution":false,
  "user":{
     "can_merge":true
  }
};

export const OPEN_MR = {
  "id":807106,
  "iid":2,
  "project_id":76316,
  "title":"Update test.txt opened",
  "description":"Still opened mr body",
  "state":"opened",
  "created_at":"2023-06-28T14:32:40.943Z",
  "updated_at":"2023-06-28T14:35:56.433Z",
  "merged_by":null,
  "merge_user":null,
  "merged_at":null,
  "closed_by":null,
  "closed_at":null,
  "target_branch":"main",
  "source_branch":"feature",
  "user_notes_count":0,
  "upvotes":0,
  "downvotes":0,
  "author":{
     "id":14041,
     "username":"superuser",
     "name":"Super User",
     "state":"active",
     "avatar_url":"https://my.gitlab.host.com/uploads/-/system/user/avatar/14041/avatar.png",
     "web_url":"https://my.gitlab.host.com/superuser"
  },
  "assignees":[
     {
        "id":14041,
        "username":"superuser",
        "name":"Super User",
        "state":"active",
        "avatar_url":"https://my.gitlab.host.com/uploads/-/system/user/avatar/14041/avatar.png",
        "web_url":"https://my.gitlab.host.com/superuser"
     }
  ],
  "assignee":{
     "id":14041,
     "username":"superuser",
     "name":"Super User",
     "state":"active",
     "avatar_url":"https://my.gitlab.host.com/uploads/-/system/user/avatar/14041/avatar.png",
     "web_url":"https://my.gitlab.host.com/superuser"
  },
  "reviewers":[
     {
        "id":14041,
        "username":"superuser",
        "name":"Super User",
        "state":"active",
        "avatar_url":"https://my.gitlab.host.com/uploads/-/system/user/avatar/14041/avatar.png",
        "web_url":"https://my.gitlab.host.com/superuser"
     }
  ],
  "source_project_id":76316,
  "target_project_id":76316,
  "labels":[
     
  ],
  "draft":false,
  "work_in_progress":false,
  "milestone":null,
  "merge_when_pipeline_succeeds":false,
  "merge_status":"checking",
  "detailed_merge_status":"checking",
  "sha":"9e15674ebd48e05c6e428a1fa31dbb60a778d644",
  "merge_commit_sha":null,
  "squash_commit_sha":null,
  "discussion_locked":null,
  "should_remove_source_branch":null,
  "force_remove_source_branch":true,
  "reference":"!2",
  "references":{
     "short":"!2",
     "relative":"!2",
     "full":"superuser/backporting-example!2"
  },
  "web_url":"https://my.gitlab.host.com/superuser/backporting-example/-/merge_requests/2",
  "time_stats":{
     "time_estimate":0,
     "total_time_spent":0,
     "human_time_estimate":null,
     "human_total_time_spent":null
  },
  "squash":false,
  "squash_on_merge":false,
  "task_completion_status":{
     "count":0,
     "completed_count":0
  },
  "has_conflicts":false,
  "blocking_discussions_resolved":true,
  "approvals_before_merge":null,
  "subscribed":true,
  "changes_count":"1",
  "latest_build_started_at":null,
  "latest_build_finished_at":null,
  "first_deployed_to_production_at":null,
  "pipeline":null,
  "head_pipeline":null,
  "diff_refs":{
     "base_sha":"2c553a0c4c133a51806badce5fa4842b7253cb3b",
     "head_sha":"9e15674ebd48e05c6e428a1fa31dbb60a778d644",
     "start_sha":"2c553a0c4c133a51806badce5fa4842b7253cb3b"
  },
  "merge_error":null,
  "first_contribution":false,
  "user":{
     "can_merge":true
  }
};

export const CLOSED_NOT_MERGED_MR = {
  "id":807191,
  "iid":3,
  "project_id":76316,
  "title":"Update test.txt",
  "description":"",
  "state":"closed",
  "created_at":"2023-06-28T15:44:50.549Z",
  "updated_at":"2023-06-28T15:44:58.318Z",
  "merged_by":null,
  "merge_user":null,
  "merged_at":null,
  "closed_by":{
     "id":14041,
     "username":"superuser",
     "name":"Super User",
     "state":"active",
     "avatar_url":"https://my.gitlab.host.com/uploads/-/system/user/avatar/14041/avatar.png",
     "web_url":"https://my.gitlab.host.com/superuser"
  },
  "closed_at":"2023-06-28T15:44:58.349Z",
  "target_branch":"main",
  "source_branch":"closed",
  "user_notes_count":0,
  "upvotes":0,
  "downvotes":0,
  "author":{
     "id":14041,
     "username":"superuser",
     "name":"Super User",
     "state":"active",
     "avatar_url":"https://my.gitlab.host.com/uploads/-/system/user/avatar/14041/avatar.png",
     "web_url":"https://my.gitlab.host.com/superuser"
  },
  "assignees":[
     {
        "id":14041,
        "username":"superuser",
        "name":"Super User",
        "state":"active",
        "avatar_url":"https://my.gitlab.host.com/uploads/-/system/user/avatar/14041/avatar.png",
        "web_url":"https://my.gitlab.host.com/superuser"
     }
  ],
  "assignee":{
     "id":14041,
     "username":"superuser",
     "name":"Super User",
     "state":"active",
     "avatar_url":"https://my.gitlab.host.com/uploads/-/system/user/avatar/14041/avatar.png",
     "web_url":"https://my.gitlab.host.com/superuser"
  },
  "reviewers":[
     {
        "id":14041,
        "username":"superuser",
        "name":"Super User",
        "state":"active",
        "avatar_url":"https://my.gitlab.host.com/uploads/-/system/user/avatar/14041/avatar.png",
        "web_url":"https://my.gitlab.host.com/superuser"
     }
  ],
  "source_project_id":76316,
  "target_project_id":76316,
  "labels":[
     
  ],
  "draft":false,
  "work_in_progress":false,
  "milestone":null,
  "merge_when_pipeline_succeeds":false,
  "merge_status":"can_be_merged",
  "detailed_merge_status":"not_open",
  "sha":"c8ce0ffdd372c2ed89d65f9e3f6f3681e6d16eb3",
  "merge_commit_sha":null,
  "squash_commit_sha":null,
  "discussion_locked":null,
  "should_remove_source_branch":null,
  "force_remove_source_branch":true,
  "reference":"!3",
  "references":{
     "short":"!3",
     "relative":"!3",
     "full":"superuser/backporting-example!3"
  },
  "web_url":"https://my.gitlab.host.com/superuser/backporting-example/-/merge_requests/3",
  "time_stats":{
     "time_estimate":0,
     "total_time_spent":0,
     "human_time_estimate":null,
     "human_total_time_spent":null
  },
  "squash":false,
  "squash_on_merge":false,
  "task_completion_status":{
     "count":0,
     "completed_count":0
  },
  "has_conflicts":false,
  "blocking_discussions_resolved":true,
  "approvals_before_merge":null,
  "subscribed":true,
  "changes_count":"1",
  "latest_build_started_at":null,
  "latest_build_finished_at":null,
  "first_deployed_to_production_at":null,
  "pipeline":null,
  "head_pipeline":null,
  "diff_refs":{
     "base_sha":"4d369c3e9a8d1d5b7e56c892a8ab2a7666583ac3",
     "head_sha":"c8ce0ffdd372c2ed89d65f9e3f6f3681e6d16eb3",
     "start_sha":"4d369c3e9a8d1d5b7e56c892a8ab2a7666583ac3"
  },
  "merge_error":null,
  "first_contribution":false,
  "user":{
     "can_merge":true
  }
};

export const OPEN_PR_COMMITS = [
   {
      "id":"974519f65c9e0ed65277cd71026657a09fca05e7",
      "short_id":"974519f6",
      "created_at":"2023-07-10T19:23:04.000Z",
      "parent_ids":[
         
      ],
      "title":"Add another file",
      "message":"Add another file",
      "author_name":"Super User",
      "author_email":"superuser@email.com",
      "authored_date":"2023-07-10T19:23:04.000Z",
      "committer_name":"Super User",
      "committer_email":"superuser@email.com",
      "committed_date":"2023-07-10T19:23:04.000Z",
      "trailers":{
         
      },
      "web_url":"https://gitlab.com/superuser/backporting-example/-/commit/974519f65c9e0ed65277cd71026657a09fca05e7"
   },
   {
      "id":"e4dd336a4a20f394df6665994df382fb1d193a11",
      "short_id":"e4dd336a",
      "created_at":"2023-06-29T09:59:10.000Z",
      "parent_ids":[
         
      ],
      "title":"Add new file",
      "message":"Add new file",
      "author_name":"Super User",
      "author_email":"superuser@email.com",
      "authored_date":"2023-06-29T09:59:10.000Z",
      "committer_name":"Super User",
      "committer_email":"superuser@email.com",
      "committed_date":"2023-06-29T09:59:10.000Z",
      "trailers":{
         
      },
      "web_url":"https://gitlab.com/superuser/backporting-example/-/commit/e4dd336a4a20f394df6665994df382fb1d193a11"
   }
];

export const SUPERUSER = {
   "id":14041,
   "username":"superuser",
   "name":"Super USer",
   "state":"active",
   "avatar_url":"https://my.gitlab.host.com/uploads/-/system/user/avatar/14041/avatar.png",
   "web_url":"https://my.gitlab.host.com/superuser"
};
