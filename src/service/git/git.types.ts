export interface GitPullRequest {
  number?: number,
  author: string,
  url?: string,
  htmlUrl?: string,
  state?: GitRepoState,
  merged?: boolean,
  mergedBy?: string,
  title: string,
  body: string,
  reviewers: string[],
  assignees: string[],
  targetRepo: GitRepository,
  sourceRepo: GitRepository,
  nCommits?: number, // number of commits in the pr
  commits?: string[], // merge commit or last one
  branchName?: string,
}

export interface GitRepository {
  owner: string,
  project: string,
  cloneUrl: string
}

export interface BackportPullRequest {
  owner: string, // repository's owner
  repo: string, // repository's name
  head: string, // name of the source branch
  base: string, // name of the target branch
  title: string, // pr title
  body: string, // pr body
  reviewers: string[], // pr list of reviewers
  assignees: string[], // pr list of assignees
  branchName?: string,
}

export enum GitClientType {
  GITHUB = "github",
  GITLAB = "gitlab",
}

export enum GitRepoState {
  OPEN = "open",
  CLOSED = "closed",
  LOCKED = "locked", // just on gitlab
  MERGED = "merged", // just on gitlab
}