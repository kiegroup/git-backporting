

import { BackportPullRequest, GitPullRequest } from "@bp/service/git/git.types";

export interface LocalGit {
  user: string, // local git user
  email: string, // local git email
} 

/**
 * Internal configuration object
 */
export interface Configs {
  dryRun: boolean,
  auth?: string,
  git: LocalGit,
  folder: string,
  mergeStrategy?: string, // cherry-pick merge strategy
  mergeStrategyOption?: string, // cherry-pick merge strategy option
  originalPullRequest: GitPullRequest,
  backportPullRequests: BackportPullRequest[],
 }

export enum AuthTokenId {
  // github specific token
  GITHUB_TOKEN = "GITHUB_TOKEN",
  // gitlab specific token
  GITLAB_TOKEN = "GITLAB_TOKEN",
  // codeberg specific token
  CODEBERG_TOKEN = "CODEBERG_TOKEN",
  // generic git token
  GIT_TOKEN = "GIT_TOKEN",
}