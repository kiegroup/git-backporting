

import { GitPullRequest } from "@bp/service/git/git.types";

/**
 * Internal configuration object
 */
export interface Configs {
  dryRun: boolean,
  auth: string,
  author: string, // author of the backport pr
  folder: string,
  targetBranch: string,
  originalPullRequest: GitPullRequest,
  backportPullRequest: GitPullRequest
 }

