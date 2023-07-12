

import { GitPullRequest } from "@bp/service/git/git.types";

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
  targetBranch: string,
  mergeStrategy?: string, // cherry-pick merge strategy
  mergeStrategyOption?: string, // cherry-pick merge strategy option
  originalPullRequest: GitPullRequest,
  backportPullRequest: GitPullRequest,
 }

