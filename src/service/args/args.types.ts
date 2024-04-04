/**
 * Tool's input arguments interface
 */
export interface Args {
  // NOTE: keep targetBranch as singular and of type string for backward compatibilities
  targetBranch?: string,  // comma separated list of branches on the target repo where the change should be backported to
  targetBranchPattern?: string, // regular expression to extract target branch(es) from pull request labels
  pullRequest: string, // url of the pull request to backport
  dryRun?: boolean, // if enabled do not push anything remotely
  auth?: string, // git service auth, like github token
  folder?: string, // local folder where the repositories should be cloned
  gitClient?: string, // git client
  gitUser?: string, // local git user, default 'GitHub'
  gitEmail?: string, // local git email, default 'noreply@github.com'
  title?: string, // backport pr title, default original pr title prefixed by target branch
  body?: string, // backport pr title, default original pr body prefixed by bodyPrefix
  bodyPrefix?: string, // backport pr body prefix, default `backport <original-pr-link>`
  // NOTE: keep bpBranchName as singular and of type string for backward compatibilities
  bpBranchName?: string, // comma separated list of backport pr branch names, default computed from commit and target branches
  reviewers?: string[], // backport pr reviewers
  assignees?: string[], // backport pr assignees
  inheritReviewers?: boolean, // if true and reviewers == [] then inherit reviewers from original pr
  labels?: string[], // backport pr labels
  inheritLabels?: boolean, // if true inherit labels from original pr
  squash?: boolean,
  autoNoSquash?: boolean,
  strategy?: string, // cherry-pick merge strategy
  strategyOption?: string, // cherry-pick merge strategy option
  cherryPickOptions?: string, // additional cherry-pick options
  comments?: string[], // additional comments to be posted
  enableErrorNotification?: boolean, // enable the error notification on original pull request
}