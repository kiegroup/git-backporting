export interface GitPullRequest {
  number?: number,
  author: string,
  url: string,
  htmlUrl?: string,
  state?: GitRepoState,
  merged?: boolean,
  mergedBy?: string,
  title: string,
  body: string,
  reviewers: string[],
  assignees: string[],
  labels: string[],
  targetRepo: GitRepository,
  sourceRepo: GitRepository,
  nCommits: number, // number of commits in the pr
  commits: string[], // merge commit or last one
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
  labels: string[], // pr list of assigned labels
  comments: string[], // pr list of additional comments
  // branchName?: string,
}

export enum GitClientType {
  GITHUB = "github",
  GITLAB = "gitlab",
  CODEBERG = "codeberg",
}

export enum GitRepoState {
  OPEN = "open",
  CLOSED = "closed",
  LOCKED = "locked", // just on gitlab
  MERGED = "merged", // just on gitlab
}