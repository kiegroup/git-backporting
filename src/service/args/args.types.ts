/**
 * Input arguments
 */
export interface Args {
  dryRun: boolean, // if enabled do not push anything remotely
  auth: string, // git service auth, like github token
  targetBranch: string,  // branch on the target repo where the change should be backported to
  pullRequest: string, // url of the pull request to backport
  folder?: string, // local folder where the repositories should be cloned
  author?: string, // backport pr author, default taken from pr
  title?: string, // backport pr title, default original pr title prefixed by target branch
  body?: string, // backport pr title, default original pr body prefixed by bodyPrefix
  bodyPrefix?: string, // backport pr body prefix, default `backport <original-pr-link>`
  bpBranchName?: string, // backport pr branch name, default computed from commit
}