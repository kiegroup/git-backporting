<h1 align="center">
  Git Backporting </br>
  :outbox_tray: :inbox_tray:
</h1>

<p align="center">
  <a href="https://github.com/kiegroup/git-backporting">
    <img alt="ci checks status" src="https://github.com/kiegroup/git-backporting/actions/workflows/ci.yml/badge.svg">
  </a>
  <a href="https://badge.fury.io/js/@kie%git-backporting">
    <img alt="npm version" src="https://badge.fury.io/js/@kie%2Fgit-backporting.svg">
  </a>
</p>

---

## :bangbang: Starting from v4 git-backporting has been moved under @kiegroup organization and renamed :bangbang:

---

**Git Backporting** is a [NodeJS](https://nodejs.org/) command line tool that provides capabilities to *backport* pull requests (on *GitHub*) and merge requests (on *GitLab*) in an automated way. This tool also comes with a predefined *GitHub* action in order to make CI/CD integration easier for all users.


Table of content
----------------

* **[Who is this tool for](#who-is-this-tool-for)**
* **[CLI tool](#cli-tool)**
* **[Supported git services](#supported-git-services)**
* **[GitHub action](#github-action)**
* **[Future works](#future-works)**
* **[Release](#release)**
* **[Repository migration](#repository-migration)**
* **[Contributing](#contributing)**
* **[License](#license)**

## Who is this tool for?

`git-backporting` is a tool that provides capabilities to *backport* pull requests (on *GitHub*) and merge requests (on *GitLab*) in an automated way.

> *What is backporting?* - backporting is an action aiming to move a change (usually a commit) from a branch (usually the main one) to another one, which is generally referring to a still maintained release branch. Keeping it simple: it is about to move a specific change or a set of them from one branch to another.

Therefore this tools is for anybody who is working on projects where they have to maintain multiple active branches/versions at the same time. If you are actively cherry-picking many changes from your main branch to other ones, and you mainly do changes through pull requests or merge requests, maybe this tool may be right for you.

## CLI tool

This tool is released on the [public npm registry](https://www.npmjs.com/), therefore it can be easily installed using `npm`:

```bash
$ npm install -g @kie/git-backporting
```

> **NOTE**: if you want to download version 3 or older you must use the older package name `@lampajr/bper` instead of `@kie/git-backporting`.

Then you just have to choose the pull request (or merge request on *Gitlab*) that you would like to backport and the target branch and the simply run the following command:

```bash
$ git-backporting -tb <branch> -pr <pull-request-url> -a <git-token>
```

A real example could be the following one:
```bash
$ git-backporting -tb develop -pr https://github.com/kiegroup/git-backporting-example/pull/47 -a *****
```

This is the easiest invocation where you let the tool set / compute most of the backported pull request data. Obviously most of that data can be overridden with appropriate tool options, more details can be found in the [inputs](#inputs) section.

> **NOTE**: if you are still using version 3 or older you must use the older CLI tool name `bper` instead of `git-backporting`.

### Requirements

* Node 16 or higher, more details on Node can be found [here](https://nodejs.org/en).
* Git, see [how to install](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) if you need help.

### Inputs

This tool comes with some inputs that allow users to override the default behavior, here the full list of available inputs:

| **Name**      | **Command**          | **Required** | **Description**                                                                                                                                        | **Default** |
|---------------|----------------------|--------------|--------------------------------------------------------------------------------------------------------------------------------------------------------|-------------|
| Version       | -V, --version        | -            | Current version of the tool                                                                                                                            |             |
| Help          | -h, --help           | -            | Display the help message                                                                                                                               |             |
| Target Branch | -tb, --target-branch | N            | Branch where the changes must be backported to                                                                                                         |             |
| Pull Request  | -pr, --pull-request  | N            | Original pull request url, the one that must be backported, e.g., https://github.com/kiegroup/git-backporting/pull/1                                        |             |
| Configuration File  | -cf, --config-file  | N            | Configuration file, in JSON format, containing all options to be overridded, note that if provided all other CLI options will be ignored                                        |             |
| Auth          | -a, --auth           | N            | `GITHUB_TOKEN`, `GITLAB_TOKEN` or a `repo` scoped [Personal Access Token](https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token) | ""          |
| Folder        | -f, --folder         | N            | Local folder full name of the repository that will be checked out, e.g., /tmp/folder                                                                                     | {cwd}/bp    |
| Git User       | -gu, --git-user        | N            | Local git user name                                                       | "GitHub"       |
| Git Email       | -ge, --git-email        | N            | Local git user email                                                       | "noreply@github.com"       |
| Title       | --title        | N            | Backporting pull request title                                                       | "{original-pr-title}"       |
| Body       | --body        | N            | Backporting pull request body                                                           | "{original-pr-body}"       |
| Body Prefix       | --body-prefix        | N            | Prefix to the backporting pull request body                                                          | "Backport: {original-pr-link}"       |
| Reviewers       | --reviewers        | N            | Backporting pull request comma-separated reviewers list                                                           | []       |
| Assignees       | --assignes        | N            | Backporting pull request comma-separated assignees list                                                           | []       |
| No Reviewers Inheritance       | --no-inherit-reviewers        | N            | Considered only if reviewers is empty, if true keep reviewers as empty list, otherwise inherit from original pull request                                                           | false       |
| Backport Branch Name       | --bp-branch-name        | N            | Name of the backporting pull request branch                                                           | bp-{target-branch}-{sha}       |
| Dry Run       | -d, --dry-run        | N            | If enabled the tool does not push nor create anything remotely, use this to skip PR creation                                                           | false       |

> **NOTE**: `pull request` and `target branch` are *mandatory*, they must be provided as CLI options or as part of the configuration file (if used).

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
Keep in mind that its structue MUST match the [Args](src/service/args/args.types.ts) interface, which is actually a camel-case version of the CLI options.

## Supported git services

Right now **Git Backporting** supports the following git management services:
 * ***GITHUB***: Introduced since the first release of this tool (version `1.0.0`). The interaction with this system is performed using [*octokit*](https://octokit.github.io/rest.js) client library.

 * ***GITLAB***: This has been introduced since version `3.0.0`, it works for both public and private *GitLab* servers. The interaction with this service is performed using plain [*axios*](https://axios-http.com) requests. The *gitlab* api version that is used to make requests is `v4`, at the moment there is no possibility to override it.

> **NOTE**: by default, all gitlab requests are performed setting `rejectUnauthorized=false`, planning to make this configurable too.

## GitHub action

This action can be used in any *GitHub* workflow, below you can find a simple example of manually triggered workflow backporting a specific pull request (provided as input).

```yml
name: Pull Request Backporting using BPer

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
name: Pull Request Backporting using BPer

on:
  pull_request_target:
    types:
      - closed
      - labeled

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
          auth: ${{ secrets.GITHUB_TOKEN }}
```

For a complete description of all inputs see [Inputs section](#inputs).

## Future works

**BPer** is still in development mode, this means that there are still many future works and extension. I'll try to summarize the most important ones:

- Provide a way to backport single commit too (or a set of them), even if no original pull request is present.
- Integrate this tool with other git management services (like Bitbucket) to make it as generic as possible.
- Integrate it into other CI/CD services like gitlab CI.
- Provide some reusable *GitHub* workflows.

## Release

The release of this package is entirely based on [release-it](https://github.com/release-it/release-it) tool. I created some useful scripts that can make the release itself quite easy.


### Automated release

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

### Manual release

In case we would like to perform a manual release, it would be enough to open a pull request changing the following items:
- Package version inside the `package.json`
- Provide exhaustive changelog information inside `CHANGELOG.md`
- Commit like `chore: release v<version>`

Once the release preparion pull request got merged, run [Release package](.github/workflows/release.yml) workflow.

## Repository Migration

From version `v4.0.0` the project has been moved under [@kiegroup](https://github.com/kiegroup) organization. During this migration we changed some things that you should be aware of. I'll try to summarize them in the following table:

> **NOTE**: these changes did not affect the tool features.

|             | **v4 (after migration)** | v3 or older (before migration) |
|-------------|--------------------------|--------------------------------|
| Owner       | kiegroup                 | lampajr                        |
| Repository  | git-backporting          | backporting                    |
| NPM package | @kie/git-backporting     | @lampajr/bper                  |
| CLI tool    | git-backporting          | bper                           |

So everytime you would use older version keep in mind of these changes.

> **REMARK**: since from capabilities point of view `v3.1.1` and `v4.0.0` are equivalent we would recommend to directly start using `v4`.

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

## License

Backporting (BPer) open source project is licensed under the [MIT](./LICENSE) license.