<h1 align="center">
  Git Backporting </br>
  :outbox_tray: :inbox_tray:
</h1>

<p align="center">
  <a href="https://github.com/kiegroup/git-backporting">
    <img alt="ci checks status" src="https://github.com/kiegroup/git-backporting/actions/workflows/ci.yml/badge.svg">
  </a>
  <a href="https://badge.fury.io/js/@kie%2Fgit-backporting">
    <img alt="npm version" src="https://badge.fury.io/js/@kie%2Fgit-backporting.svg">
  </a>
</p>

---

**Git Backporting** is a [NodeJS](https://nodejs.org/) command line tool that provides capabilities to *backport* pull requests (on *GitHub*) and merge requests (on *GitLab*) in an automated way. This tool also comes with a predefined *GitHub* action in order to make CI/CD integration easier for all users.


Table of content
----------------

* **[Who is this tool for](#who-is-this-tool-for)**
* **[CLI tool](#cli-tool)**
* **[GitHub action](#github-action)**
* **[Future works](#future-works)**
* **[Development](#development)**
* **[Contributing](#contributing)**
* **[License](#license)**

## Who is this tool for?

`git-backporting` is a fully configurable tool that provides capabilities to *backport* pull requests (on *GitHub*) and merge requests (on *GitLab*) in an automated way.

> *What is backporting?* - backporting is an action aiming to move a change (usually a commit) from a branch (usually the main one) to another one, which is generally referring to a still maintained release branch. Keeping it simple: it is about to move a specific change or a set of them from one branch to another.

Therefore this tools is for anybody who is working on projects where they have to maintain multiple active branches/versions at the same time. If you are actively cherry-picking many changes from your main branch to other ones, and you mainly do changes through pull requests or merge requests, maybe this tool may be right for you.

## CLI tool

>  All instructions provided below pertain to version `v4` of the tool. If you wish to use an earlier version, please refer to the documentation from the corresponding tag/release.

This tool is released on the [public npm registry](https://www.npmjs.com/), therefore it can be easily installed using `npm`:

```bash
$ npm install -g @kie/git-backporting
```

Then you just have to choose the pull request (or merge request on *Gitlab*) that you would like to backport and the target branch and then simply run the following command:

```bash
$ git-backporting -tb <branch> -pr <pull-request-url> -a <git-token>
```

A real example could be the following one:
```bash
$ git-backporting -tb develop -pr https://github.com/kiegroup/git-backporting-example/pull/47 -a *****
```

This is the easiest invocation where you let the tool set / compute most of the backported pull request data. Obviously most of that data can be overridden with appropriate tool options, more details can be found in the [inputs](#inputs) section.

### Requirements

* Node 16 or higher, more details on Node can be found [here](https://nodejs.org/en).
* Git, see [how to install](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) if you need help.

### How it works?

It works in this way: given the provided `pull/merge request` it infers the server API to use (either *Github* or *Gitlab* for now) and retrieves the corresponding pull request object (original pull/merge request to be backported into another branch).

After that it clones the corresponding git repository, check out in the provided `target branch` and create a new branch from that (name automatically generated if not provided as option).

By default the tool will try to cherry-pick the single squashed/merged commit into the newly created branch (please consider using `--no-squash` option if you want to cherry-pick all commits belonging to the provided pull request).

Based on the original pull request, creates a new one containing the backporting to the target branch. Note that most of these information can be overridden with appropriate CLI options or GHA inputs.

#### Default cherry-pick strategy

The default cherry-pick strategy is `recursive` with `theirs` option for automatic conflicts resolution. Therefore, by default, all commits are cherry-picked using the following git-equivalent command:
```bash
$ git cherry-pick -m 1 --strategy=recursive --strategy-option=theirs <sha>
```

From version `v4.2.0` we made both `strategy` and `strategy-option` fully configurable from CLI or GitHub action, so if users need a specific strategy which differs from the default one please consider using either `--strategy` or `--strategy-option`, or their equivalent GitHub action inputs, more details in [inputs](#inputs) section.

> **NOTE**: If there are any conflicts, the tool will block the process and exit signalling the failure as there are still no ways to interactively resolve them. In these cases a manual cherry-pick is needed, or alternatively users could manually resume the process in the cloned repository (here the user will have to resolve the conflicts, push the branch and create the pull request - all manually).

### Inputs

This tool comes with some inputs that allow users to override the default behavior, here the full list of available inputs:

| **Name**      | **Command**          | **Required** | **Description**                                                                                                                                        | **Default** |
|---------------|----------------------|--------------|--------------------------------------------------------------------------------------------------------------------------------------------------------|-------------|
| Version       | -V, --version        | -            | Current version of the tool                                                                                                                            |             |
| Help          | -h, --help           | -            | Display the help message                                                                                                                               |             |
| Target Branches | -tb, --target-branch | N            | Comma separated list of branches where the changes must be backported to                                                                                                         |             |
| Pull Request  | -pr, --pull-request  | N            | Original pull request url, the one that must be backported, e.g., https://github.com/kiegroup/git-backporting/pull/1                                        |             |
| Configuration File  | -cf, --config-file  | N            | Configuration file, in JSON format, containing all options to be overridded, note that if provided all other CLI options will be ignored                                        |             |
| Auth          | -a, --auth           | N            | Git access/authorization token, if provided all token env variables will be ignored. See [auth token](#authorization-token) section for more details | ""          |
| Folder        | -f, --folder         | N            | Local folder full name of the repository that will be checked out, e.g., /tmp/folder                                                                                     | {cwd}/bp    |
| Git Client       | --git-client        | N            | Git client type <github|gitlab|codeberg>, if not set it is infered from pull-request
| Git User       | -gu, --git-user        | N            | Local git user name                                                       | "GitHub"       |
| Git Email       | -ge, --git-email        | N            | Local git user email                                                       | "noreply@github.com"       |
| Title       | --title        | N            | Backporting pull request title                                                       | "{original-pr-title}"       |
| Body       | --body        | N            | Backporting pull request body                                                           | "{original-pr-body}"       |
| Body Prefix       | --body-prefix        | N            | Prefix to the backporting pull request body                                                          | "Backport: {original-pr-link}"       |
| Reviewers       | --reviewers        | N            | Backporting pull request comma-separated reviewers list                                                           | []       |
| Assignees       | --assignes        | N            | Backporting pull request comma-separated assignees list                                                           | []       |
| No Reviewers Inheritance       | --no-inherit-reviewers        | N            | Considered only if reviewers is empty, if true keep reviewers as empty list, otherwise inherit from original pull request                                                           | false       |
| Backport Branch Names       | --bp-branch-name        | N            | Comma separated lists of the backporting pull request branch names, if they exceeds 250 chars they will be truncated                                                           | bp-{target-branch}-{sha1}...{shaN}       |
| Labels       | --labels        | N            | Provide custom labels to be added to the backporting pull request                                                           | []       |
| Inherit labels       | --inherit-labels        | N            | If enabled inherit lables from the original pull request                                                           | false       |
| No squash       | --no-squash        | N            | If provided the backporting will try to backport all pull request commits without squashing                                                           | false       |
| Strategy       | --strategy        | N            | Cherry pick merging strategy, see [git-merge](https://git-scm.com/docs/git-merge#_merge_strategies) doc for all possible values                                                           | "recursive"       |
| Strategy Option       | --strategy-option        | N            | Cherry pick merging strategy option, see [git-merge](https://git-scm.com/docs/git-merge#_merge_strategies) doc for all possible values                                                           | "theirs"       |
| Additional comments       | --comments        | N            | Semicolon separated list of additional comments to be posted to the backported pull request                                                           | []       |
| Dry Run       | -d, --dry-run        | N            | If enabled the tool does not push nor create anything remotely, use this to skip PR creation                                                           | false       |

> **NOTE**: `pull request` and `target branch` are *mandatory*, they must be provided as CLI options or as part of the configuration file (if used).

#### Authorization token

Since version `4.5.0` we introduced a new feature that allows user to provide the git access token through environment variables. These env variables are taken into consideration only if the `--auth/-a` is not provided as argument/input.
Here the supported list of env variables:
- `GITHUB_TOKEN`: this is checked only if backporting on Github platform.
- `GITLAB_TOKEN`: this is checked only if backporting on Gitlab platform.
- `CODEBERG_TOKEN`: this is checked only if backporting on Codeberg platform.
- `GIT_TOKEN`: this is considered if none of the previous envs are set.

> **NOTE**: if `--auth` argument is provided, all env variables will be ignored even if not empty.

#### Configuration file example

This is an example of a configuration file that can be used.
```json
{
  "pullRequest": "https://gitlab.com/<namespace>/<repo>/-/merge_requests/1",
  "targetBranch": "old",
  "folder": "/tmp/my-folder",
  "title": "Override Title",
  "auth": "*****"
}
```
Keep in mind that its structure MUST match the [Args](src/service/args/args.types.ts) interface, which is actually a camel-case version of the CLI options.

### Supported git services

Right now **Git Backporting** supports the following git management services:
 * ***GITHUB***: Introduced since the first release of this tool (version `1.0.0`). The interaction with this system is performed using [*octokit*](https://octokit.github.io/rest.js) client library.

 * ***GITLAB***: This has been introduced since version `3.0.0`, it works for both public and private *GitLab* servers. The interaction with this service is performed using plain [*axios*](https://axios-http.com) requests. The *gitlab* api version that is used to make requests is `v4`, at the moment there is no possibility to override it.

 * ***CODEBERG***: Introduced since version `4.4.0`, it works for public [codeberg.org](https://codeberg.org/) platform. Thanks to the api compatibility with GitHub, the interaction with this service is performed using using [*octokit*](https://octokit.github.io/rest.js) client library.

> **NOTE**: by default, all gitlab requests are performed setting `rejectUnauthorized=false`, planning to make this configurable too.

## GitHub action

This action can be used in any *GitHub* workflow, below you can find a simple example of manually triggered workflow backporting a specific pull request (provided as input).

```yml
name: Pull Request Backporting using Git Backporting

on: 
  workflow_dispatch:
    inputs:
      targetBranch:
        description: 'Target branch'
        required: true
        type: string
      pullRequest:
        description: 'Pull request'
        required: true 
        type: string
      dryRun:
        description: 'Dry run'
        required: false
        default: "true" 
        type: string

jobs:
  backporting:
    name: "Backporting"
    runs-on: ubuntu-latest
    steps:
      - name: Backporting
        uses: kiegroup/git-backporting@main
        with:
          target-branch: ${{ inputs.targetBranch }}
          pull-request: ${{ inputs.pullRequest }}
          auth: ${{ secrets.GITHUB_TOKEN }}
          dry-run: ${{ inputs.dryRun }}
```

You can also use this action with other events - you'll just need to specify `target-branch` and `pull-request` params.

For example, this configuration creates a pull request against branch `v1` once the current one is merged, provided that the label `backport-v1` is applied:

```yaml
name: Pull Request Backporting using Git Backporting

on:
  pull_request_target:
    types:
      - closed
      - labeled

env:
  GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

jobs:
  backporting:
    name: "Backporting"
    # Only react to merged PRs for security reasons.
    # See https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#pull_request_target.
    if: >
      github.event.pull_request.merged
      && (
        github.event.action == 'closed'
          && contains(github.event.pull_request.labels.*.name, 'backport-v1')
        || (
          github.event.action == 'labeled'
          && contains(github.event.label.name, 'backport-v1')
        )
      )
    runs-on: ubuntu-latest
    steps:
      - name: Backporting
        uses: kiegroup/git-backporting@main
        with:
          target-branch: v1
          pull-request: ${{ github.event.pull_request.url }}
```

For a complete description of all inputs see [Inputs section](#inputs).

## Future works

**Git Backporting** is still in development mode, this means that there are still many future works and extension that can be implemented. I'll try to summarize the most important ones:

- Provide a way to backport single commit (or a set of them) if no original pull request is present.
- Integrate this tool with other git management services (like Bitbucket) to make it as generic as possible.
- Integrate it into other CI/CD services like gitlab CI.
- Provide some reusable *GitHub* workflows.

## Development

### Package release

The release of this package is entirely based on [release-it](https://github.com/release-it/release-it) tool. I created some useful scripts that can make the release itself quite easy.


#### Automatic release

The first step is to prepare the changes for the next release, this is done by running:

```bash
$ npm run release:prepare:all
```

> NOTE: running locally this requires `npm login`, please consider using `.github/workflows/prepare-release.yml` if you don't have permission on the npm package.

This script performs the following steps:
 1. Automatically computes the next version based on the last commits
 2. Create a new branch `release/v${computed_version}`
 3. Apply all changes, like version and changelog upgrade
 4. Commit those changes: `chore: release v${compute_version}`

After that you should just push the new branch and open the pull request.
> NOTE: if you don't want to run this preparation from you local environment, there is already a workflow that does all these steps, including the pull request. See [Prepare release](.github/workflows/prepare-release.yml) workflow.

Once the release preparion pull request got merged, you can run [Release package](.github/workflows/release.yml) workflow that automatically performs the release itself, including npm publishing, git tag and github release.

#### Manual release

In case we would like to perform a manual release, it would be enough to open a pull request changing the following items:
- Package version inside the `package.json`
- Provide exhaustive changelog information inside `CHANGELOG.md`
- Commit like `chore: release v<version>`

Once the release preparion pull request got merged, run [Release package](.github/workflows/release.yml) workflow.

## Contributing

This is an open source project, and you are more than welcome to contribute :heart:!

Every change must be submitted through a *GitHub* pull request (PR). Backporting uses continuous integration (CI). The CI runs checks against your branch after you submit the PR to ensure that your PR doesn’t introduce errors. If the CI identifies a potential problem, our friendly PR maintainers will help you resolve it.

> **Note**: this project follows [git-conventional-commits](https://gist.github.com/qoomon/5dfcdf8eec66a051ecd85625518cfd13) standards, thanks to the [commit-msg hook](./.husky/commit-msg) you are not allowed to use commits that do not follow those standards.

1. Fork it (https://github.com/kiegroup/git-backporting).

2. Create your feature branch: (git checkout -b feature).

3. Commit your changes with a comment: (git commit -am 'Add some feature').

4. Push to the branch to GitHub: (git push origin feature).

5. Create a new pull request against `main` branch.

> **Note**: you don't need to take care about typescript compilation and minifycation, there are automated [git hooks](./.husky) taking care of that!

**Hint**: if you are still in a `work in progress` branch and you want to push your changes remotely, consider adding `--no-verify` for both `commit` and `push`, e.g., `git push origin <feat-branch> --no-verify`

## License

Git backporting open source project is licensed under the [MIT](./LICENSE) license.