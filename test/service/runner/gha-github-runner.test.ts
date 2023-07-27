import ArgsParser from "@bp/service/args/args-parser";
import Runner from "@bp/service/runner/runner";
import GitCLIService from "@bp/service/git/git-cli";
import GitHubClient from "@bp/service/git/github/github-client";
import GHAArgsParser from "@bp/service/args/gha/gha-args-parser";
import { createTestFile, removeTestFile, spyGetInput } from "../../support/utils";
import { mockGitHubClient } from "../../support/mock/git-client-mock-support";
import GitClientFactory from "@bp/service/git/git-client-factory";
import { GitClientType } from "@bp/service/git/git.types";

const GITHUB_MERGED_PR_W_OVERRIDES_CONFIG_FILE_CONTENT_PATHNAME = "./gha-github-runner-pr-merged-with-overrides.json";
const GITHUB_MERGED_PR_W_OVERRIDES_CONFIG_FILE_CONTENT = {
  "dryRun": false,
  "auth": "my-auth-token",
  "pullRequest": "https://github.com/owner/reponame/pull/2368",
  "targetBranch": "target",
  "gitUser": "Me",
  "gitEmail": "me@email.com",
  "title": "New Title",
  "body": "New Body",
  "bodyPrefix": "New Body Prefix - ",
  "bpBranchName": "bp_branch_name",
  "reviewers": [],
  "assignees": ["user3", "user4"],
  "inheritReviewers": false,
  "labels": ["gha github cherry pick :cherries:"],
  "inheritLabels": true,
};


jest.mock("@bp/service/git/git-cli");
jest.spyOn(GitHubClient.prototype, "createPullRequest");
jest.spyOn(GitClientFactory, "getOrCreate");

let parser: ArgsParser;
let runner: Runner;

beforeAll(() => {
  // create a temporary file
  createTestFile(GITHUB_MERGED_PR_W_OVERRIDES_CONFIG_FILE_CONTENT_PATHNAME, JSON.stringify(GITHUB_MERGED_PR_W_OVERRIDES_CONFIG_FILE_CONTENT));
});

afterAll(() => {
  // clean up all temporary files
  removeTestFile(GITHUB_MERGED_PR_W_OVERRIDES_CONFIG_FILE_CONTENT_PATHNAME);
});

beforeEach(() => {
  mockGitHubClient();

  // create GHA arguments parser
  parser = new GHAArgsParser();

  // create runner
  runner = new Runner(parser);
});

describe("gha runner", () => {
  test("with dry run", async () => {
    spyGetInput({
      "dry-run": "true",
      "target-branch": "target",
      "pull-request": "https://github.com/owner/reponame/pull/2368"
    });
    
    await runner.execute();

    const cwd = process.cwd() + "/bp";

    expect(GitClientFactory.getOrCreate).toBeCalledTimes(1);
    expect(GitClientFactory.getOrCreate).toBeCalledWith(GitClientType.GITHUB, undefined, "https://api.github.com");

    expect(GitCLIService.prototype.clone).toBeCalledTimes(1);
    expect(GitCLIService.prototype.clone).toBeCalledWith("https://github.com/owner/reponame.git", cwd, "target");

    expect(GitCLIService.prototype.createLocalBranch).toBeCalledTimes(1);
    expect(GitCLIService.prototype.createLocalBranch).toBeCalledWith(cwd, "bp-target-28f63db");
    
    expect(GitCLIService.prototype.fetch).toBeCalledTimes(1);
    expect(GitCLIService.prototype.fetch).toBeCalledWith(cwd, "pull/2368/head:pr/2368");

    expect(GitCLIService.prototype.cherryPick).toBeCalledTimes(1);
    expect(GitCLIService.prototype.cherryPick).toBeCalledWith(cwd, "28f63db774185f4ec4b57cd9aaeb12dbfb4c9ecc", undefined, undefined);

    expect(GitCLIService.prototype.push).toBeCalledTimes(0);
    expect(GitHubClient.prototype.createPullRequest).toBeCalledTimes(0);
  });

  test("without dry run", async () => {
    spyGetInput({
      "target-branch": "target",
      "pull-request": "https://github.com/owner/reponame/pull/2368"
    });

    await runner.execute();

    const cwd = process.cwd() + "/bp";

    expect(GitClientFactory.getOrCreate).toBeCalledTimes(1);
    expect(GitClientFactory.getOrCreate).toBeCalledWith(GitClientType.GITHUB, undefined, "https://api.github.com");

    expect(GitCLIService.prototype.clone).toBeCalledTimes(1);
    expect(GitCLIService.prototype.clone).toBeCalledWith("https://github.com/owner/reponame.git", cwd, "target");

    expect(GitCLIService.prototype.createLocalBranch).toBeCalledTimes(1);
    expect(GitCLIService.prototype.createLocalBranch).toBeCalledWith(cwd, "bp-target-28f63db");
    
    expect(GitCLIService.prototype.fetch).toBeCalledTimes(1);
    expect(GitCLIService.prototype.fetch).toBeCalledWith(cwd, "pull/2368/head:pr/2368");

    expect(GitCLIService.prototype.cherryPick).toBeCalledTimes(1);
    expect(GitCLIService.prototype.cherryPick).toBeCalledWith(cwd, "28f63db774185f4ec4b57cd9aaeb12dbfb4c9ecc", undefined, undefined);

    expect(GitCLIService.prototype.push).toBeCalledTimes(1);
    expect(GitCLIService.prototype.push).toBeCalledWith(cwd, "bp-target-28f63db");

    expect(GitHubClient.prototype.createPullRequest).toBeCalledTimes(1);
    expect(GitHubClient.prototype.createPullRequest).toBeCalledWith({
        owner: "owner", 
        repo: "reponame", 
        head: "bp-target-28f63db", 
        base: "target", 
        title: "[target] PR Title", 
        body: "**Backport:** https://github.com/owner/reponame/pull/2368\r\n\r\nPlease review and merge",
        reviewers: ["gh-user", "that-s-a-user"],
        assignees: [],
        labels: [],
        comments: [],
      }
    );
  });

  test("closed and not merged pull request", async () => {
    spyGetInput({
      "target-branch": "target",
      "pull-request": "https://github.com/owner/reponame/pull/6666"
    });

    await expect(() => runner.execute()).rejects.toThrow("Provided pull request is closed and not merged");
  });

  test("open pull request", async () => {
    spyGetInput({
      "target-branch": "target",
      "pull-request": "https://github.com/owner/reponame/pull/4444"
    });

    await runner.execute();

    const cwd = process.cwd() + "/bp";

    expect(GitClientFactory.getOrCreate).toBeCalledTimes(1);
    expect(GitClientFactory.getOrCreate).toBeCalledWith(GitClientType.GITHUB, undefined, "https://api.github.com");

    expect(GitCLIService.prototype.clone).toBeCalledTimes(1);
    expect(GitCLIService.prototype.clone).toBeCalledWith("https://github.com/owner/reponame.git", cwd, "target");

    expect(GitCLIService.prototype.createLocalBranch).toBeCalledTimes(1);
    expect(GitCLIService.prototype.createLocalBranch).toBeCalledWith(cwd, "bp-target-9174896");
    
    expect(GitCLIService.prototype.fetch).toBeCalledTimes(1);
    expect(GitCLIService.prototype.fetch).toBeCalledWith(cwd, "pull/4444/head:pr/4444");

    expect(GitCLIService.prototype.cherryPick).toBeCalledTimes(1);
    expect(GitCLIService.prototype.cherryPick).toBeCalledWith(cwd, "91748965051fae1330ad58d15cf694e103267c87", undefined, undefined);

    expect(GitCLIService.prototype.push).toBeCalledTimes(1);
    expect(GitCLIService.prototype.push).toBeCalledWith(cwd, "bp-target-9174896");

    expect(GitHubClient.prototype.createPullRequest).toBeCalledTimes(1);
    expect(GitHubClient.prototype.createPullRequest).toBeCalledWith({
        owner: "owner", 
        repo: "reponame", 
        head: "bp-target-9174896", 
        base: "target", 
        title: "[target] PR Title", 
        body: "**Backport:** https://github.com/owner/reponame/pull/4444\r\n\r\nPlease review and merge",
        reviewers: ["gh-user"],
        assignees: [],
        labels: [],
        comments: [],
      }
    );
  });

  test("override backporting pr data", async () => {
    spyGetInput({
      "target-branch": "target",
      "pull-request": "https://github.com/owner/reponame/pull/2368",
      "title": "New Title",
      "body": "New Body",
      "body-prefix": "New Body Prefix\\r\\n\\r\\n",
      "bp-branch-name": "bp_branch_name",
      "reviewers": "user1, user2",
      "assignees": "user3, user4",
    });

    await runner.execute();

    const cwd = process.cwd() + "/bp";

    expect(GitClientFactory.getOrCreate).toBeCalledTimes(1);
    expect(GitClientFactory.getOrCreate).toBeCalledWith(GitClientType.GITHUB, undefined, "https://api.github.com");

    expect(GitCLIService.prototype.clone).toBeCalledTimes(1);
    expect(GitCLIService.prototype.clone).toBeCalledWith("https://github.com/owner/reponame.git", cwd, "target");

    expect(GitCLIService.prototype.createLocalBranch).toBeCalledTimes(1);
    expect(GitCLIService.prototype.createLocalBranch).toBeCalledWith(cwd, "bp_branch_name");
    
    expect(GitCLIService.prototype.fetch).toBeCalledTimes(1);
    expect(GitCLIService.prototype.fetch).toBeCalledWith(cwd, "pull/2368/head:pr/2368");

    expect(GitCLIService.prototype.cherryPick).toBeCalledTimes(1);
    expect(GitCLIService.prototype.cherryPick).toBeCalledWith(cwd, "28f63db774185f4ec4b57cd9aaeb12dbfb4c9ecc", undefined, undefined);

    expect(GitCLIService.prototype.push).toBeCalledTimes(1);
    expect(GitCLIService.prototype.push).toBeCalledWith(cwd, "bp_branch_name");

    expect(GitHubClient.prototype.createPullRequest).toBeCalledTimes(1);
    expect(GitHubClient.prototype.createPullRequest).toBeCalledWith({
        owner: "owner", 
        repo: "reponame", 
        head: "bp_branch_name", 
        base: "target", 
        title: "New Title", 
        body: "New Body Prefix\r\n\r\nNew Body",
        reviewers: ["user1", "user2"],
        assignees: ["user3", "user4"],
        labels: [],
        comments: [],
      }
    );
  });

  test("set empty reviewers", async () => {
    spyGetInput({
      "target-branch": "target",
      "pull-request": "https://github.com/owner/reponame/pull/2368",
      "title": "New Title",
      "body": "New Body",
      "body-prefix": "New Body Prefix - ",
      "bp-branch-name": "bp_branch_name",
      "reviewers": "",
      "assignees": "user3, user4",
      "no-inherit-reviewers": "true",
    });

    await runner.execute();

    const cwd = process.cwd() + "/bp";

    expect(GitClientFactory.getOrCreate).toBeCalledTimes(1);
    expect(GitClientFactory.getOrCreate).toBeCalledWith(GitClientType.GITHUB, undefined, "https://api.github.com");

    expect(GitCLIService.prototype.clone).toBeCalledTimes(1);
    expect(GitCLIService.prototype.clone).toBeCalledWith("https://github.com/owner/reponame.git", cwd, "target");

    expect(GitCLIService.prototype.createLocalBranch).toBeCalledTimes(1);
    expect(GitCLIService.prototype.createLocalBranch).toBeCalledWith(cwd, "bp_branch_name");
    
    expect(GitCLIService.prototype.fetch).toBeCalledTimes(1);
    expect(GitCLIService.prototype.fetch).toBeCalledWith(cwd, "pull/2368/head:pr/2368");

    expect(GitCLIService.prototype.cherryPick).toBeCalledTimes(1);
    expect(GitCLIService.prototype.cherryPick).toBeCalledWith(cwd, "28f63db774185f4ec4b57cd9aaeb12dbfb4c9ecc", undefined, undefined);

    expect(GitCLIService.prototype.push).toBeCalledTimes(1);
    expect(GitCLIService.prototype.push).toBeCalledWith(cwd, "bp_branch_name");

    expect(GitHubClient.prototype.createPullRequest).toBeCalledTimes(1);
    expect(GitHubClient.prototype.createPullRequest).toBeCalledWith({
        owner: "owner", 
        repo: "reponame", 
        head: "bp_branch_name", 
        base: "target", 
        title: "New Title", 
        body: "New Body Prefix - New Body",
        reviewers: [],
        assignees: ["user3", "user4"],
        labels: [],
        comments: [],
      }
    );
  });

  test("set custom labels with inheritance", async () => {
    spyGetInput({
      "target-branch": "target",
      "pull-request": "https://github.com/owner/reponame/pull/2368",
      "labels": "cherry-pick :cherries:, another-label",
      "inherit-labels": "true",
    });

    await runner.execute();

    const cwd = process.cwd() + "/bp";

    expect(GitClientFactory.getOrCreate).toBeCalledTimes(1);
    expect(GitClientFactory.getOrCreate).toBeCalledWith(GitClientType.GITHUB, undefined, "https://api.github.com");

    expect(GitCLIService.prototype.clone).toBeCalledTimes(1);
    expect(GitCLIService.prototype.clone).toBeCalledWith("https://github.com/owner/reponame.git", cwd, "target");

    expect(GitCLIService.prototype.createLocalBranch).toBeCalledTimes(1);
    expect(GitCLIService.prototype.createLocalBranch).toBeCalledWith(cwd, "bp-target-28f63db");
    
    expect(GitCLIService.prototype.fetch).toBeCalledTimes(1);
    expect(GitCLIService.prototype.fetch).toBeCalledWith(cwd, "pull/2368/head:pr/2368");

    expect(GitCLIService.prototype.cherryPick).toBeCalledTimes(1);
    expect(GitCLIService.prototype.cherryPick).toBeCalledWith(cwd, "28f63db774185f4ec4b57cd9aaeb12dbfb4c9ecc", undefined, undefined);

    expect(GitCLIService.prototype.push).toBeCalledTimes(1);
    expect(GitCLIService.prototype.push).toBeCalledWith(cwd, "bp-target-28f63db");

    expect(GitHubClient.prototype.createPullRequest).toBeCalledTimes(1);
    expect(GitHubClient.prototype.createPullRequest).toBeCalledWith({
        owner: "owner", 
        repo: "reponame", 
        head: "bp-target-28f63db", 
        base: "target", 
        title: "[target] PR Title", 
        body: "**Backport:** https://github.com/owner/reponame/pull/2368\r\n\r\nPlease review and merge",
        reviewers: ["gh-user", "that-s-a-user"],
        assignees: [],
        labels: ["cherry-pick :cherries:", "another-label", "original-label"],
        comments: [],
      }
    );
  });

  test("set custom labels without inheritance", async () => {
    spyGetInput({
      "target-branch": "target",
      "pull-request": "https://github.com/owner/reponame/pull/2368",
      "labels": "cherry-pick :cherries:, another-label",
      "inherit-labels": "false",
    });

    await runner.execute();

    const cwd = process.cwd() + "/bp";

    expect(GitClientFactory.getOrCreate).toBeCalledTimes(1);
    expect(GitClientFactory.getOrCreate).toBeCalledWith(GitClientType.GITHUB, undefined, "https://api.github.com");

    expect(GitCLIService.prototype.clone).toBeCalledTimes(1);
    expect(GitCLIService.prototype.clone).toBeCalledWith("https://github.com/owner/reponame.git", cwd, "target");

    expect(GitCLIService.prototype.createLocalBranch).toBeCalledTimes(1);
    expect(GitCLIService.prototype.createLocalBranch).toBeCalledWith(cwd, "bp-target-28f63db");
    
    expect(GitCLIService.prototype.fetch).toBeCalledTimes(1);
    expect(GitCLIService.prototype.fetch).toBeCalledWith(cwd, "pull/2368/head:pr/2368");

    expect(GitCLIService.prototype.cherryPick).toBeCalledTimes(1);
    expect(GitCLIService.prototype.cherryPick).toBeCalledWith(cwd, "28f63db774185f4ec4b57cd9aaeb12dbfb4c9ecc", undefined, undefined);

    expect(GitCLIService.prototype.push).toBeCalledTimes(1);
    expect(GitCLIService.prototype.push).toBeCalledWith(cwd, "bp-target-28f63db");

    expect(GitHubClient.prototype.createPullRequest).toBeCalledTimes(1);
    expect(GitHubClient.prototype.createPullRequest).toBeCalledWith({
        owner: "owner", 
        repo: "reponame", 
        head: "bp-target-28f63db", 
        base: "target", 
        title: "[target] PR Title", 
        body: "**Backport:** https://github.com/owner/reponame/pull/2368\r\n\r\nPlease review and merge",
        reviewers: ["gh-user", "that-s-a-user"],
        assignees: [],
        labels: ["cherry-pick :cherries:", "another-label"],
        comments: [],
      }
    );
  });

  test("using config file with overrides", async () => {
    spyGetInput({
      "config-file": GITHUB_MERGED_PR_W_OVERRIDES_CONFIG_FILE_CONTENT_PATHNAME,
    });
    
    await runner.execute();

    const cwd = process.cwd() + "/bp";

    expect(GitClientFactory.getOrCreate).toBeCalledTimes(1);
    expect(GitClientFactory.getOrCreate).toBeCalledWith(GitClientType.GITHUB, "my-auth-token", "https://api.github.com");

    expect(GitCLIService.prototype.clone).toBeCalledTimes(1);
    expect(GitCLIService.prototype.clone).toBeCalledWith("https://github.com/owner/reponame.git", cwd, "target");

    expect(GitCLIService.prototype.createLocalBranch).toBeCalledTimes(1);
    expect(GitCLIService.prototype.createLocalBranch).toBeCalledWith(cwd, "bp_branch_name");
    
    expect(GitCLIService.prototype.fetch).toBeCalledTimes(1);
    expect(GitCLIService.prototype.fetch).toBeCalledWith(cwd, "pull/2368/head:pr/2368");

    expect(GitCLIService.prototype.cherryPick).toBeCalledTimes(1);
    expect(GitCLIService.prototype.cherryPick).toBeCalledWith(cwd, "28f63db774185f4ec4b57cd9aaeb12dbfb4c9ecc", undefined, undefined);

    expect(GitCLIService.prototype.push).toBeCalledTimes(1);
    expect(GitCLIService.prototype.push).toBeCalledWith(cwd, "bp_branch_name");

    expect(GitHubClient.prototype.createPullRequest).toBeCalledTimes(1);
    expect(GitHubClient.prototype.createPullRequest).toBeCalledWith({
        owner: "owner", 
        repo: "reponame", 
        head: "bp_branch_name", 
        base: "target", 
        title: "New Title", 
        body: "New Body Prefix - New Body",
        reviewers: [],
        assignees: ["user3", "user4"],
        labels: ["gha github cherry pick :cherries:", "original-label"],
        comments: [],
      }
    );
  });

  // to check: https://github.com/kiegroup/git-backporting/issues/52
  test("using github api url instead of html one", async () => {
    spyGetInput({
      "target-branch": "target",
      "pull-request": "https://api.github.com/repos/owner/reponame/pulls/2368"
    });

    await runner.execute();

    const cwd = process.cwd() + "/bp";

    expect(GitClientFactory.getOrCreate).toBeCalledTimes(1);
    expect(GitClientFactory.getOrCreate).toBeCalledWith(GitClientType.GITHUB, undefined, "https://api.github.com");

    expect(GitCLIService.prototype.clone).toBeCalledTimes(1);
    expect(GitCLIService.prototype.clone).toBeCalledWith("https://github.com/owner/reponame.git", cwd, "target");

    expect(GitCLIService.prototype.createLocalBranch).toBeCalledTimes(1);
    expect(GitCLIService.prototype.createLocalBranch).toBeCalledWith(cwd, "bp-target-28f63db");
    
    expect(GitCLIService.prototype.fetch).toBeCalledTimes(1);
    expect(GitCLIService.prototype.fetch).toBeCalledWith(cwd, "pull/2368/head:pr/2368");

    expect(GitCLIService.prototype.cherryPick).toBeCalledTimes(1);
    expect(GitCLIService.prototype.cherryPick).toBeCalledWith(cwd, "28f63db774185f4ec4b57cd9aaeb12dbfb4c9ecc", undefined, undefined);

    expect(GitCLIService.prototype.push).toBeCalledTimes(1);
    expect(GitCLIService.prototype.push).toBeCalledWith(cwd, "bp-target-28f63db");

    expect(GitHubClient.prototype.createPullRequest).toBeCalledTimes(1);
    expect(GitHubClient.prototype.createPullRequest).toBeCalledWith({
        owner: "owner", 
        repo: "reponame", 
        head: "bp-target-28f63db", 
        base: "target", 
        title: "[target] PR Title", 
        body: "**Backport:** https://github.com/owner/reponame/pull/2368\r\n\r\nPlease review and merge",
        reviewers: ["gh-user", "that-s-a-user"],
        assignees: [],
        labels: [],
        comments: [],
      }
    );
  });

  test("multiple commits pr", async () => {
    spyGetInput({
      "target-branch": "target",
      "pull-request": "https://api.github.com/repos/owner/reponame/pulls/8632",
      "no-squash": "true",
    });
    
    await runner.execute();

    const cwd = process.cwd() + "/bp";

    expect(GitClientFactory.getOrCreate).toBeCalledTimes(1);
    expect(GitClientFactory.getOrCreate).toBeCalledWith(GitClientType.GITHUB, undefined, "https://api.github.com");

    expect(GitCLIService.prototype.clone).toBeCalledTimes(1);
    expect(GitCLIService.prototype.clone).toBeCalledWith("https://github.com/owner/reponame.git", cwd, "target");

    expect(GitCLIService.prototype.createLocalBranch).toBeCalledTimes(1);
    expect(GitCLIService.prototype.createLocalBranch).toBeCalledWith(cwd, "bp-target-0404fb9-11da4e3");
    
    expect(GitCLIService.prototype.fetch).toBeCalledTimes(0);

    expect(GitCLIService.prototype.cherryPick).toBeCalledTimes(2);
    expect(GitCLIService.prototype.cherryPick).toBeCalledWith(cwd, "0404fb922ab75c3a8aecad5c97d9af388df04695", undefined, undefined);
    expect(GitCLIService.prototype.cherryPick).toBeCalledWith(cwd, "11da4e38aa3e577ffde6d546f1c52e53b04d3151", undefined, undefined);

    expect(GitCLIService.prototype.push).toBeCalledTimes(1);
    expect(GitCLIService.prototype.push).toBeCalledWith(cwd, "bp-target-0404fb9-11da4e3");

    expect(GitHubClient.prototype.createPullRequest).toBeCalledTimes(1);
    expect(GitHubClient.prototype.createPullRequest).toBeCalledWith({
        owner: "owner", 
        repo: "reponame", 
        head: "bp-target-0404fb9-11da4e3", 
        base: "target", 
        title: "[target] PR Title", 
        body: "**Backport:** https://github.com/owner/reponame/pull/8632\r\n\r\nPlease review and merge",
        reviewers: ["gh-user", "that-s-a-user"],
        assignees: [],
        labels: [],
        comments: [],
      }
    );
  });

  test("using github api url and different strategy", async () => {
    spyGetInput({
      "target-branch": "target",
      "pull-request": "https://api.github.com/repos/owner/reponame/pulls/2368",
      "strategy": "ort",
      "strategy-option": "ours",
    });

    await runner.execute();

    const cwd = process.cwd() + "/bp";

    expect(GitClientFactory.getOrCreate).toBeCalledTimes(1);
    expect(GitClientFactory.getOrCreate).toBeCalledWith(GitClientType.GITHUB, undefined, "https://api.github.com");

    expect(GitCLIService.prototype.clone).toBeCalledTimes(1);
    expect(GitCLIService.prototype.clone).toBeCalledWith("https://github.com/owner/reponame.git", cwd, "target");

    expect(GitCLIService.prototype.createLocalBranch).toBeCalledTimes(1);
    expect(GitCLIService.prototype.createLocalBranch).toBeCalledWith(cwd, "bp-target-28f63db");
    
    expect(GitCLIService.prototype.fetch).toBeCalledTimes(1);
    expect(GitCLIService.prototype.fetch).toBeCalledWith(cwd, "pull/2368/head:pr/2368");

    expect(GitCLIService.prototype.cherryPick).toBeCalledTimes(1);
    expect(GitCLIService.prototype.cherryPick).toBeCalledWith(cwd, "28f63db774185f4ec4b57cd9aaeb12dbfb4c9ecc", "ort", "ours");

    expect(GitCLIService.prototype.push).toBeCalledTimes(1);
    expect(GitCLIService.prototype.push).toBeCalledWith(cwd, "bp-target-28f63db");

    expect(GitHubClient.prototype.createPullRequest).toBeCalledTimes(1);
    expect(GitHubClient.prototype.createPullRequest).toBeCalledWith({
        owner: "owner", 
        repo: "reponame", 
        head: "bp-target-28f63db", 
        base: "target", 
        title: "[target] PR Title", 
        body: "**Backport:** https://github.com/owner/reponame/pull/2368\r\n\r\nPlease review and merge",
        reviewers: ["gh-user", "that-s-a-user"],
        assignees: [],
        labels: [],
        comments: [],
      }
    );
  });

  test("additional pr comments", async () => {
    spyGetInput({
      "target-branch": "target",
      "pull-request": "https://github.com/owner/reponame/pull/2368",
      "comments": "first comment; second comment",
    });

    await runner.execute();

    const cwd = process.cwd() + "/bp";

    expect(GitClientFactory.getOrCreate).toBeCalledTimes(1);
    expect(GitClientFactory.getOrCreate).toBeCalledWith(GitClientType.GITHUB, undefined, "https://api.github.com");

    expect(GitCLIService.prototype.clone).toBeCalledTimes(1);
    expect(GitCLIService.prototype.clone).toBeCalledWith("https://github.com/owner/reponame.git", cwd, "target");

    expect(GitCLIService.prototype.createLocalBranch).toBeCalledTimes(1);
    expect(GitCLIService.prototype.createLocalBranch).toBeCalledWith(cwd, "bp-target-28f63db");
    
    expect(GitCLIService.prototype.fetch).toBeCalledTimes(1);
    expect(GitCLIService.prototype.fetch).toBeCalledWith(cwd, "pull/2368/head:pr/2368");

    expect(GitCLIService.prototype.cherryPick).toBeCalledTimes(1);
    expect(GitCLIService.prototype.cherryPick).toBeCalledWith(cwd, "28f63db774185f4ec4b57cd9aaeb12dbfb4c9ecc", undefined, undefined);

    expect(GitCLIService.prototype.push).toBeCalledTimes(1);
    expect(GitCLIService.prototype.push).toBeCalledWith(cwd, "bp-target-28f63db");

    expect(GitHubClient.prototype.createPullRequest).toBeCalledTimes(1);
    expect(GitHubClient.prototype.createPullRequest).toBeCalledWith({
        owner: "owner", 
        repo: "reponame", 
        head: "bp-target-28f63db", 
        base: "target", 
        title: "[target] PR Title", 
        body: "**Backport:** https://github.com/owner/reponame/pull/2368\r\n\r\nPlease review and merge",
        reviewers: ["gh-user", "that-s-a-user"],
        assignees: [],
        labels: [],
        comments: ["first comment", "second comment"],
      }
    );
  });
});