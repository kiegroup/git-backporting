<h1 align="center">BPER: Git Backporter</h1>
<h2 align="center">:outbox_tray: :inbox_tray:</h2>

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
* **[Contributions](#contributions)**


## Usage

### Inputs

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

For a complete description of all inputs see [Inputs section](#inputs).

## Limitations

## Contributions