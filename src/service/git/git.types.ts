export interface GitPullRequest {
  url: string,
  patchUrl: string,
  state: string,
  title: string,
  body: string,
  reviewers: string[],
  targetRepo: string,
  sourceRepo: string,
  commits: string[]
}

export enum GitServiceType {
  GITHUB = "github"
}