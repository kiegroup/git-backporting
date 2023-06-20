<h1 align="center">
  BPER: Git Backporter </br>
  :outbox_tray: :inbox_tray:
</h1>

<p align="center">
  <a href="https://github.com/lampajr/backporting">
    <img alt="CI Checks Status" src="https://github.com/lampajr/backporting/actions/workflows/ci.yml/badge.svg">
  </a>
</p>

---

**BPer** is a [NodeJS](https://nodejs.org/) command line tool that provides capabilities to *backport* [1] pull requests in an automated way. This tool also comes with a predefined GitHub action in order to make CI/CD integration easier for all users.

[1] *backporting* is an action aiming to move a change (usually a commit) from a branch (usually the main one) to another one, which is generally referring to a still maintained release branch. Keeping it simple: it is about to move a specific change or a set of them from one branch to another.

Table of content
----------------

* **[Usage](#usage)**
* **[GitHub Action](#github-action)**
* **[Limitations](#limitations)**
* **[Contributions](#contributing)**
* **[License](#license)**


## Usage

This tool is released on the [public npm registry](https://www.npmjs.com/), therefore it can be easily installed using `npm`:

```bash
$ npm install -g @lampajr/bper
```

Then it can be used as any other command line tool:

```bash
$ bper -tb <branch> -pr <pull-request-url> -a <github-token> [-f <your-folder>]
```

### Inputs

This toold comes with some inputs that allow users to override the default behavior, here the full list of available inputs:

| **Name**      | **Command**          | **Required** | **Description**                                                                                                                                        | **Default** |
|---------------|----------------------|--------------|--------------------------------------------------------------------------------------------------------------------------------------------------------|-------------|
| Version       | -V, --version        | -            | Current version of the tool                                                                                                                            |             |
| Help          | -h, --help           | -            | Display the help message                                                                                                                               |             |
| Target Branch | -tb, --target-branch | Y            | Branch where the changes must be backported to                                                                                                         |             |
| Pull Request  | -pr, --pull-request  | Y            | Original pull request url, the one that must be backported, e.g., https://github.com/lampajr/backporting/pull/1                                        |             |
| Auth          | -a, --auth           | N            | `GITHUB_TOKEN` or a `repo` scoped [Personal Access Token](https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token) | ""          |
| Folder        | -f, --folder         | N            | Local folder where the repo will be checked out, e.g., /tmp/folder                                                                                     | {cwd}/bp    |
| Title       | --title        | N            | Backporting pull request title                                                       | "{original-pr-title}"       |
| Body       | --body        | N            | Backporting pull request body                                                           | "{original-pr-body}"       |
| Body Prefix       | --body-prefix        | N            | Prefix to the backporting pull request body                                                          | "Backport: {original-pr-link}"       |
| Backport Branch Name       | --bp-branch-name        | N            | Name of the backporting pull request branch                                                           | bp-{target-branch}-{sha}       |
| Dry Run       | -d, --dry-run        | N            | If enabled the tool does not push nor create anything remotely, use this to skip PR creation                                                           | false       |


## GitHub Action

This action can be used in any GitHub workflow, below you can find a simple example of manually triggered workflow backporting a specific pull request (provided as input).

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
        uses: lampajr/backporting@main
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
        uses: lampajr/backporting@main
        with:
          target-branch: v1
          pull-request: ${{ github.event.pull_request.url }}
          auth: ${{ secrets.GITHUB_TOKEN }}
```

For a complete description of all inputs see [Inputs section](#inputs).

## Limitations

**BPer** is in development mode, this means that it has many limitations right now. I'll try to summarize the most importan ones:

- You can backport pull requests only.
- It only works for [GitHub](https://github.com/).
- Integrated in GitHub Actions CI/CD only.

Based on these limitations, the next **Future Works** could be the following:
- Provide a way to backport single commit too (or a set of them), even if no original pull request is present.
- Integrate this tool with other git management services (like GitLab and Bitbucket) to make it as generic as possible.
- Provide some reusable GitHub workflows.

## Contributing

This is an open source project, and you are more than welcome to contribute :heart:!

Every change must be submitted through a GitHub pull request (PR). Backporting uses continuous integration (CI). The CI runs checks against your branch after you submit the PR to ensure that your PR doesn’t introduce errors. If the CI identifies a potential problem, our friendly PR maintainers will help you resolve it.

> **Note**: this project follows [git-conventional-commits](https://gist.github.com/qoomon/5dfcdf8eec66a051ecd85625518cfd13) standards, thanks to the [commit-msg hook](./.husky/commit-msg) you are not allowed to use commits that do not follow those standards.

1. Fork it (https://github.com/lampajr/backporting).

2. Create your feature branch: (git checkout -b feature).

3. Commit your changes with a comment: (git commit -am 'Add some feature').

4. Push to the branch to GitHub: (git push origin feature).

5. Create a new pull request against `main` branch.

> **Note**: you don't need to take care about typescript compilation and minifycation, there are automated [git hooks](./.husky) taking care of that!

## License

Backporting (BPer) open source project is licensed under the [MIT](./LICENSE) license.