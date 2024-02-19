import { GitPullRequest, GitRepoState, GitRepository } from "@bp/service/git/git.types";
import GitResponseMapper from "@bp/service/git/git-mapper";
import { MergeRequestSchema, ProjectSchema } from "@gitbeaker/rest";
import { Axios } from "axios";

export default class GitLabMapper implements GitResponseMapper<MergeRequestSchema, string> {

  private readonly client;
  // needs client to perform additional requests
  constructor(client: Axios) {
    this.client = client;
  }

  mapGitState(state: string): GitRepoState {
    switch (state) {
      case "opened":
        return GitRepoState.OPEN;
      case "closed":
        return GitRepoState.CLOSED;
      case "merged":
        return GitRepoState.MERGED;
      default:
        return GitRepoState.LOCKED;
    }
  }
  
  async mapPullRequest(mr: MergeRequestSchema, commits?: string[]): Promise<GitPullRequest> {
    return {
      number: mr.iid,
      author: mr.author.username,
      url: mr.web_url,
      htmlUrl: mr.web_url,
      title: mr.title,
      body: mr.description,
      state: this.mapGitState(mr.state),
      merged: this.isMerged(mr),
      mergedBy: mr.merged_by?.username,
      reviewers: mr.reviewers?.map((r => r.username)) ?? [],
      assignees: mr.assignees?.map((r => r.username)) ?? [],
      labels: mr.labels ?? [],
      sourceRepo: await this.mapSourceRepo(mr),
      targetRepo: await this.mapTargetRepo(mr),
      // if commits list is provided use that as source
      nCommits: (commits && commits.length > 0) ? commits.length : 1,
      commits: (commits && commits.length > 0) ? commits : this.getSha(mr)
    };
  }
  
  private getSha(mr: MergeRequestSchema) {
    // if mr is merged, use merge_commit_sha otherwise use sha
    // what is the difference between sha and diff_refs.head_sha?
    return this.isMerged(mr) ? [mr.squash_commit_sha ? mr.squash_commit_sha : mr.merge_commit_sha as string] : [mr.sha];
  }

  async mapSourceRepo(mr: MergeRequestSchema): Promise<GitRepository> {
    const project: ProjectSchema = await this.getProject(mr.source_project_id);
    
    return {
      owner: project.namespace.full_path, // or just proj.path?
      project: project.path,
      cloneUrl: project.http_url_to_repo,
    };
  }

  async mapTargetRepo(mr: MergeRequestSchema): Promise<GitRepository> {
    const project: ProjectSchema = await this.getProject(mr.target_project_id);
    
    return {
      owner: project.namespace.full_path, // or just proj.path?
      project: project.path,
      cloneUrl: project.http_url_to_repo,
    };
  }

  private isMerged(mr: MergeRequestSchema) {
    return this.mapGitState(mr.state) === GitRepoState.MERGED;
  }

  private async getProject(projectId: number): Promise<ProjectSchema> {
    const { data } = await this.client.get(`/projects/${projectId}`);
    
    if (!data) {
      throw new Error(`Project ${projectId} not found`);
    }

    return data as ProjectSchema;
  }
}