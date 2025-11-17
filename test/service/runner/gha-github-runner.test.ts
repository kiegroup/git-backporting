import ArgsParser from "@bp/service/args/args-parser";
import Runner from "@bp/service/runner/runner";
import GitCLIService from "@bp/service/git/git-cli";
import GitHubClient from "@bp/service/git/github/github-client";
import GHAArgsParser from "@bp/service/args/gha/gha-args-parser";
import { createTestFile, removeTestFile, resetEnvTokens, spyGetInput } from "../../support/utils";
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
jest.spyOn(GitHubClient.prototype, "createPullRequestComment");
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
  // reset git env tokens
  resetEnvTokens();
  
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

    expect(GitClientFactory.getOrCreate).toHaveBeenCalledTimes(1);
    expect(GitClientFactory.getOrCreate).toHaveBeenCalledWith(GitClientType.GITHUB, undefined, "https://api.github.com");

    expect(GitCLIService.prototype.clone).toHaveBeenCalledTimes(1);
    expect(GitCLIService.prototype.clone).toHaveBeenCalledWith("https://github.com/owner/reponame.git", cwd, "target");

    expect(GitCLIService.prototype.createLocalBranch).toHaveBeenCalledTimes(1);
    expect(GitCLIService.prototype.createLocalBranch).toHaveBeenCalledWith(cwd, "bp-target-28f63db");
    
    expect(GitCLIService.prototype.fetch).toHaveBeenCalledTimes(1);
    expect(GitCLIService.prototype.fetch).toHaveBeenCalledWith(cwd, "pull/2368/head:pr/2368");

    expect(GitCLIService.prototype.cherryPick).toHaveBeenCalledTimes(1);
    expect(GitCLIService.prototype.cherryPick).toHaveBeenCalledWith(cwd, "28f63db774185f4ec4b57cd9aaeb12dbfb4c9ecc", undefined, undefined, undefined);

    expect(GitCLIService.prototype.push).toHaveBeenCalledTimes(0);
    expect(GitHubClient.prototype.createPullRequest).toHaveBeenCalledTimes(0);
    expect(GitHubClient.prototype.createPullRequestComment).toHaveBeenCalledTimes(0);
  });

  test("without dry run", async () => {
    spyGetInput({
      "target-branch": "target",
      "pull-request": "https://github.com/owner/reponame/pull/2368"
    });

    await runner.execute();

    const cwd = process.cwd() + "/bp";

    expect(GitClientFactory.getOrCreate).toHaveBeenCalledTimes(1);
    expect(GitClientFactory.getOrCreate).toHaveBeenCalledWith(GitClientType.GITHUB, undefined, "https://api.github.com");

    expect(GitCLIService.prototype.clone).toHaveBeenCalledTimes(1);
    expect(GitCLIService.prototype.clone).toHaveBeenCalledWith("https://github.com/owner/reponame.git", cwd, "target");

    expect(GitCLIService.prototype.createLocalBranch).toHaveBeenCalledTimes(1);
    expect(GitCLIService.prototype.createLocalBranch).toHaveBeenCalledWith(cwd, "bp-target-28f63db");
    
    expect(GitCLIService.prototype.fetch).toHaveBeenCalledTimes(1);
    expect(GitCLIService.prototype.fetch).toHaveBeenCalledWith(cwd, "pull/2368/head:pr/2368");

    expect(GitCLIService.prototype.cherryPick).toHaveBeenCalledTimes(1);
    expect(GitCLIService.prototype.cherryPick).toHaveBeenCalledWith(cwd, "28f63db774185f4ec4b57cd9aaeb12dbfb4c9ecc", undefined, undefined, undefined);

    expect(GitCLIService.prototype.push).toHaveBeenCalledTimes(1);
    expect(GitCLIService.prototype.push).toHaveBeenCalledWith(cwd, "bp-target-28f63db");

    expect(GitHubClient.prototype.createPullRequest).toHaveBeenCalledTimes(1);
    expect(GitHubClient.prototype.createPullRequest).toHaveBeenCalledWith({
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
    expect(GitHubClient.prototype.createPullRequest).toHaveReturnedTimes(1);
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

    expect(GitClientFactory.getOrCreate).toHaveBeenCalledTimes(1);
    expect(GitClientFactory.getOrCreate).toHaveBeenCalledWith(GitClientType.GITHUB, undefined, "https://api.github.com");

    expect(GitCLIService.prototype.clone).toHaveBeenCalledTimes(1);
    expect(GitCLIService.prototype.clone).toHaveBeenCalledWith("https://github.com/owner/reponame.git", cwd, "target");

    expect(GitCLIService.prototype.createLocalBranch).toHaveBeenCalledTimes(1);
    expect(GitCLIService.prototype.createLocalBranch).toHaveBeenCalledWith(cwd, "bp-target-9174896");
    
    expect(GitCLIService.prototype.fetch).toHaveBeenCalledTimes(1);
    expect(GitCLIService.prototype.fetch).toHaveBeenCalledWith(cwd, "pull/4444/head:pr/4444");

    expect(GitCLIService.prototype.cherryPick).toHaveBeenCalledTimes(1);
    expect(GitCLIService.prototype.cherryPick).toHaveBeenCalledWith(cwd, "91748965051fae1330ad58d15cf694e103267c87", undefined, undefined, undefined);

    expect(GitCLIService.prototype.push).toHaveBeenCalledTimes(1);
    expect(GitCLIService.prototype.push).toHaveBeenCalledWith(cwd, "bp-target-9174896");

    expect(GitHubClient.prototype.createPullRequest).toHaveBeenCalledTimes(1);
    expect(GitHubClient.prototype.createPullRequest).toHaveBeenCalledWith({
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
    expect(GitHubClient.prototype.createPullRequest).toHaveReturnedTimes(1);
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

    expect(GitClientFactory.getOrCreate).toHaveBeenCalledTimes(1);
    expect(GitClientFactory.getOrCreate).toHaveBeenCalledWith(GitClientType.GITHUB, undefined, "https://api.github.com");

    expect(GitCLIService.prototype.clone).toHaveBeenCalledTimes(1);
    expect(GitCLIService.prototype.clone).toHaveBeenCalledWith("https://github.com/owner/reponame.git", cwd, "target");

    expect(GitCLIService.prototype.createLocalBranch).toHaveBeenCalledTimes(1);
    expect(GitCLIService.prototype.createLocalBranch).toHaveBeenCalledWith(cwd, "bp_branch_name");
    
    expect(GitCLIService.prototype.fetch).toHaveBeenCalledTimes(1);
    expect(GitCLIService.prototype.fetch).toHaveBeenCalledWith(cwd, "pull/2368/head:pr/2368");

    expect(GitCLIService.prototype.cherryPick).toHaveBeenCalledTimes(1);
    expect(GitCLIService.prototype.cherryPick).toHaveBeenCalledWith(cwd, "28f63db774185f4ec4b57cd9aaeb12dbfb4c9ecc", undefined, undefined, undefined);

    expect(GitCLIService.prototype.push).toHaveBeenCalledTimes(1);
    expect(GitCLIService.prototype.push).toHaveBeenCalledWith(cwd, "bp_branch_name");

    expect(GitHubClient.prototype.createPullRequest).toHaveBeenCalledTimes(1);
    expect(GitHubClient.prototype.createPullRequest).toHaveBeenCalledWith({
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
    expect(GitHubClient.prototype.createPullRequest).toHaveReturnedTimes(1);
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

    expect(GitClientFactory.getOrCreate).toHaveBeenCalledTimes(1);
    expect(GitClientFactory.getOrCreate).toHaveBeenCalledWith(GitClientType.GITHUB, undefined, "https://api.github.com");

    expect(GitCLIService.prototype.clone).toHaveBeenCalledTimes(1);
    expect(GitCLIService.prototype.clone).toHaveBeenCalledWith("https://github.com/owner/reponame.git", cwd, "target");

    expect(GitCLIService.prototype.createLocalBranch).toHaveBeenCalledTimes(1);
    expect(GitCLIService.prototype.createLocalBranch).toHaveBeenCalledWith(cwd, "bp_branch_name");
    
    expect(GitCLIService.prototype.fetch).toHaveBeenCalledTimes(1);
    expect(GitCLIService.prototype.fetch).toHaveBeenCalledWith(cwd, "pull/2368/head:pr/2368");

    expect(GitCLIService.prototype.cherryPick).toHaveBeenCalledTimes(1);
    expect(GitCLIService.prototype.cherryPick).toHaveBeenCalledWith(cwd, "28f63db774185f4ec4b57cd9aaeb12dbfb4c9ecc", undefined, undefined, undefined);

    expect(GitCLIService.prototype.push).toHaveBeenCalledTimes(1);
    expect(GitCLIService.prototype.push).toHaveBeenCalledWith(cwd, "bp_branch_name");

    expect(GitHubClient.prototype.createPullRequest).toHaveBeenCalledTimes(1);
    expect(GitHubClient.prototype.createPullRequest).toHaveBeenCalledWith({
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
    expect(GitHubClient.prototype.createPullRequest).toHaveReturnedTimes(1);
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

    expect(GitClientFactory.getOrCreate).toHaveBeenCalledTimes(1);
    expect(GitClientFactory.getOrCreate).toHaveBeenCalledWith(GitClientType.GITHUB, undefined, "https://api.github.com");

    expect(GitCLIService.prototype.clone).toHaveBeenCalledTimes(1);
    expect(GitCLIService.prototype.clone).toHaveBeenCalledWith("https://github.com/owner/reponame.git", cwd, "target");

    expect(GitCLIService.prototype.createLocalBranch).toHaveBeenCalledTimes(1);
    expect(GitCLIService.prototype.createLocalBranch).toHaveBeenCalledWith(cwd, "bp-target-28f63db");
    
    expect(GitCLIService.prototype.fetch).toHaveBeenCalledTimes(1);
    expect(GitCLIService.prototype.fetch).toHaveBeenCalledWith(cwd, "pull/2368/head:pr/2368");

    expect(GitCLIService.prototype.cherryPick).toHaveBeenCalledTimes(1);
    expect(GitCLIService.prototype.cherryPick).toHaveBeenCalledWith(cwd, "28f63db774185f4ec4b57cd9aaeb12dbfb4c9ecc", undefined, undefined, undefined);

    expect(GitCLIService.prototype.push).toHaveBeenCalledTimes(1);
    expect(GitCLIService.prototype.push).toHaveBeenCalledWith(cwd, "bp-target-28f63db");

    expect(GitHubClient.prototype.createPullRequest).toHaveBeenCalledTimes(1);
    expect(GitHubClient.prototype.createPullRequest).toHaveBeenCalledWith({
        owner: "owner", 
        repo: "reponame", 
        head: "bp-target-28f63db", 
        base: "target", 
        title: "[target] PR Title", 
        body: "**Backport:** https://github.com/owner/reponame/pull/2368\r\n\r\nPlease review and merge",
        reviewers: ["gh-user", "that-s-a-user"],
        assignees: [],
        labels: ["cherry-pick :cherries:", "another-label", "backport prod"],
        comments: [],
      }
    );
    expect(GitHubClient.prototype.createPullRequest).toHaveReturnedTimes(1);
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

    expect(GitClientFactory.getOrCreate).toHaveBeenCalledTimes(1);
    expect(GitClientFactory.getOrCreate).toHaveBeenCalledWith(GitClientType.GITHUB, undefined, "https://api.github.com");

    expect(GitCLIService.prototype.clone).toHaveBeenCalledTimes(1);
    expect(GitCLIService.prototype.clone).toHaveBeenCalledWith("https://github.com/owner/reponame.git", cwd, "target");

    expect(GitCLIService.prototype.createLocalBranch).toHaveBeenCalledTimes(1);
    expect(GitCLIService.prototype.createLocalBranch).toHaveBeenCalledWith(cwd, "bp-target-28f63db");
    
    expect(GitCLIService.prototype.fetch).toHaveBeenCalledTimes(1);
    expect(GitCLIService.prototype.fetch).toHaveBeenCalledWith(cwd, "pull/2368/head:pr/2368");

    expect(GitCLIService.prototype.cherryPick).toHaveBeenCalledTimes(1);
    expect(GitCLIService.prototype.cherryPick).toHaveBeenCalledWith(cwd, "28f63db774185f4ec4b57cd9aaeb12dbfb4c9ecc", undefined, undefined, undefined);

    expect(GitCLIService.prototype.push).toHaveBeenCalledTimes(1);
    expect(GitCLIService.prototype.push).toHaveBeenCalledWith(cwd, "bp-target-28f63db");

    expect(GitHubClient.prototype.createPullRequest).toHaveBeenCalledTimes(1);
    expect(GitHubClient.prototype.createPullRequest).toHaveBeenCalledWith({
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
    expect(GitHubClient.prototype.createPullRequest).toHaveReturnedTimes(1);
  });

  test("using config file with overrides", async () => {
    spyGetInput({
      "config-file": GITHUB_MERGED_PR_W_OVERRIDES_CONFIG_FILE_CONTENT_PATHNAME,
    });
    
    await runner.execute();

    const cwd = process.cwd() + "/bp";

    expect(GitClientFactory.getOrCreate).toHaveBeenCalledTimes(1);
    expect(GitClientFactory.getOrCreate).toHaveBeenCalledWith(GitClientType.GITHUB, "my-auth-token", "https://api.github.com");

    expect(GitCLIService.prototype.clone).toHaveBeenCalledTimes(1);
    expect(GitCLIService.prototype.clone).toHaveBeenCalledWith("https://github.com/owner/reponame.git", cwd, "target");

    expect(GitCLIService.prototype.createLocalBranch).toHaveBeenCalledTimes(1);
    expect(GitCLIService.prototype.createLocalBranch).toHaveBeenCalledWith(cwd, "bp_branch_name");
    
    expect(GitCLIService.prototype.fetch).toHaveBeenCalledTimes(1);
    expect(GitCLIService.prototype.fetch).toHaveBeenCalledWith(cwd, "pull/2368/head:pr/2368");

    expect(GitCLIService.prototype.cherryPick).toHaveBeenCalledTimes(1);
    expect(GitCLIService.prototype.cherryPick).toHaveBeenCalledWith(cwd, "28f63db774185f4ec4b57cd9aaeb12dbfb4c9ecc", undefined, undefined, undefined);

    expect(GitCLIService.prototype.push).toHaveBeenCalledTimes(1);
    expect(GitCLIService.prototype.push).toHaveBeenCalledWith(cwd, "bp_branch_name");

    expect(GitHubClient.prototype.createPullRequest).toHaveBeenCalledTimes(1);
    expect(GitHubClient.prototype.createPullRequest).toHaveBeenCalledWith({
        owner: "owner", 
        repo: "reponame", 
        head: "bp_branch_name", 
        base: "target", 
        title: "New Title", 
        body: "New Body Prefix - New Body",
        reviewers: [],
        assignees: ["user3", "user4"],
        labels: ["gha github cherry pick :cherries:", "backport prod"],
        comments: [],
      }
    );
    expect(GitHubClient.prototype.createPullRequest).toHaveReturnedTimes(1);
  });

  // to check: https://github.com/kiegroup/git-backporting/issues/52
  test("using github api url instead of html one", async () => {
    spyGetInput({
      "target-branch": "target",
      "pull-request": "https://api.github.com/repos/owner/reponame/pulls/2368"
    });

    await runner.execute();

    const cwd = process.cwd() + "/bp";

    expect(GitClientFactory.getOrCreate).toHaveBeenCalledTimes(1);
    expect(GitClientFactory.getOrCreate).toHaveBeenCalledWith(GitClientType.GITHUB, undefined, "https://api.github.com");

    expect(GitCLIService.prototype.clone).toHaveBeenCalledTimes(1);
    expect(GitCLIService.prototype.clone).toHaveBeenCalledWith("https://github.com/owner/reponame.git", cwd, "target");

    expect(GitCLIService.prototype.createLocalBranch).toHaveBeenCalledTimes(1);
    expect(GitCLIService.prototype.createLocalBranch).toHaveBeenCalledWith(cwd, "bp-target-28f63db");
    
    expect(GitCLIService.prototype.fetch).toHaveBeenCalledTimes(1);
    expect(GitCLIService.prototype.fetch).toHaveBeenCalledWith(cwd, "pull/2368/head:pr/2368");

    expect(GitCLIService.prototype.cherryPick).toHaveBeenCalledTimes(1);
    expect(GitCLIService.prototype.cherryPick).toHaveBeenCalledWith(cwd, "28f63db774185f4ec4b57cd9aaeb12dbfb4c9ecc", undefined, undefined, undefined);

    expect(GitCLIService.prototype.push).toHaveBeenCalledTimes(1);
    expect(GitCLIService.prototype.push).toHaveBeenCalledWith(cwd, "bp-target-28f63db");

    expect(GitHubClient.prototype.createPullRequest).toHaveBeenCalledTimes(1);
    expect(GitHubClient.prototype.createPullRequest).toHaveBeenCalledWith({
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
    expect(GitHubClient.prototype.createPullRequest).toHaveReturnedTimes(1);
  });

  test("multiple commits pr", async () => {
    spyGetInput({
      "target-branch": "target",
      "pull-request": "https://api.github.com/repos/owner/reponame/pulls/8632",
      "no-squash": "true",
    });
    
    await runner.execute();

    const cwd = process.cwd() + "/bp";

    expect(GitClientFactory.getOrCreate).toHaveBeenCalledTimes(1);
    expect(GitClientFactory.getOrCreate).toHaveBeenCalledWith(GitClientType.GITHUB, undefined, "https://api.github.com");

    expect(GitCLIService.prototype.clone).toHaveBeenCalledTimes(1);
    expect(GitCLIService.prototype.clone).toHaveBeenCalledWith("https://github.com/owner/reponame.git", cwd, "target");

    expect(GitCLIService.prototype.createLocalBranch).toHaveBeenCalledTimes(1);
    expect(GitCLIService.prototype.createLocalBranch).toHaveBeenCalledWith(cwd, "bp-target-0404fb9-11da4e3");
    
    expect(GitCLIService.prototype.fetch).toHaveBeenCalledTimes(0);

    expect(GitCLIService.prototype.cherryPick).toHaveBeenCalledTimes(2);
    expect(GitCLIService.prototype.cherryPick).toHaveBeenCalledWith(cwd, "0404fb922ab75c3a8aecad5c97d9af388df04695", undefined, undefined, undefined);
    expect(GitCLIService.prototype.cherryPick).toHaveBeenLastCalledWith(cwd, "11da4e38aa3e577ffde6d546f1c52e53b04d3151", undefined, undefined, undefined);

    expect(GitCLIService.prototype.push).toHaveBeenCalledTimes(1);
    expect(GitCLIService.prototype.push).toHaveBeenCalledWith(cwd, "bp-target-0404fb9-11da4e3");

    expect(GitHubClient.prototype.createPullRequest).toHaveBeenCalledTimes(1);
    expect(GitHubClient.prototype.createPullRequest).toHaveBeenCalledWith({
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
    expect(GitHubClient.prototype.createPullRequest).toHaveReturnedTimes(1);
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

    expect(GitClientFactory.getOrCreate).toHaveBeenCalledTimes(1);
    expect(GitClientFactory.getOrCreate).toHaveBeenCalledWith(GitClientType.GITHUB, undefined, "https://api.github.com");

    expect(GitCLIService.prototype.clone).toHaveBeenCalledTimes(1);
    expect(GitCLIService.prototype.clone).toHaveBeenCalledWith("https://github.com/owner/reponame.git", cwd, "target");

    expect(GitCLIService.prototype.createLocalBranch).toHaveBeenCalledTimes(1);
    expect(GitCLIService.prototype.createLocalBranch).toHaveBeenCalledWith(cwd, "bp-target-28f63db");
    
    expect(GitCLIService.prototype.fetch).toHaveBeenCalledTimes(1);
    expect(GitCLIService.prototype.fetch).toHaveBeenCalledWith(cwd, "pull/2368/head:pr/2368");

    expect(GitCLIService.prototype.cherryPick).toHaveBeenCalledTimes(1);
    expect(GitCLIService.prototype.cherryPick).toHaveBeenCalledWith(cwd, "28f63db774185f4ec4b57cd9aaeb12dbfb4c9ecc", "ort", "ours", undefined);

    expect(GitCLIService.prototype.push).toHaveBeenCalledTimes(1);
    expect(GitCLIService.prototype.push).toHaveBeenCalledWith(cwd, "bp-target-28f63db");

    expect(GitHubClient.prototype.createPullRequest).toHaveBeenCalledTimes(1);
    expect(GitHubClient.prototype.createPullRequest).toHaveBeenCalledWith({
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
    expect(GitHubClient.prototype.createPullRequest).toHaveReturnedTimes(1);
  });

  test("using github api url and additional cherry-pick options", async () => {
    spyGetInput({
      "target-branch": "target",
      "pull-request": "https://api.github.com/repos/owner/reponame/pulls/2368",
      "cherry-pick-options": "-x --allow-empty",
    });

    await runner.execute();

    const cwd = process.cwd() + "/bp";

    expect(GitClientFactory.getOrCreate).toHaveBeenCalledTimes(1);
    expect(GitClientFactory.getOrCreate).toHaveBeenCalledWith(GitClientType.GITHUB, undefined, "https://api.github.com");

    expect(GitCLIService.prototype.clone).toHaveBeenCalledTimes(1);
    expect(GitCLIService.prototype.clone).toHaveBeenCalledWith("https://github.com/owner/reponame.git", cwd, "target");

    expect(GitCLIService.prototype.createLocalBranch).toHaveBeenCalledTimes(1);
    expect(GitCLIService.prototype.createLocalBranch).toHaveBeenCalledWith(cwd, "bp-target-28f63db");

    expect(GitCLIService.prototype.fetch).toHaveBeenCalledTimes(1);
    expect(GitCLIService.prototype.fetch).toHaveBeenCalledWith(cwd, "pull/2368/head:pr/2368");

    expect(GitCLIService.prototype.cherryPick).toHaveBeenCalledTimes(1);
    expect(GitCLIService.prototype.cherryPick).toHaveBeenCalledWith(cwd, "28f63db774185f4ec4b57cd9aaeb12dbfb4c9ecc", undefined, undefined, "-x --allow-empty");

    expect(GitCLIService.prototype.push).toHaveBeenCalledTimes(1);
    expect(GitCLIService.prototype.push).toHaveBeenCalledWith(cwd, "bp-target-28f63db");

    expect(GitHubClient.prototype.createPullRequest).toHaveBeenCalledTimes(1);
    expect(GitHubClient.prototype.createPullRequest).toHaveBeenCalledWith({
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
    expect(GitHubClient.prototype.createPullRequest).toHaveReturnedTimes(1);
  });

  test("additional pr comments", async () => {
    spyGetInput({
      "target-branch": "target",
      "pull-request": "https://github.com/owner/reponame/pull/2368",
      "comments": "first comment; second comment",
    });

    await runner.execute();

    const cwd = process.cwd() + "/bp";

    expect(GitClientFactory.getOrCreate).toHaveBeenCalledTimes(1);
    expect(GitClientFactory.getOrCreate).toHaveBeenCalledWith(GitClientType.GITHUB, undefined, "https://api.github.com");

    expect(GitCLIService.prototype.clone).toHaveBeenCalledTimes(1);
    expect(GitCLIService.prototype.clone).toHaveBeenCalledWith("https://github.com/owner/reponame.git", cwd, "target");

    expect(GitCLIService.prototype.createLocalBranch).toHaveBeenCalledTimes(1);
    expect(GitCLIService.prototype.createLocalBranch).toHaveBeenCalledWith(cwd, "bp-target-28f63db");
    
    expect(GitCLIService.prototype.fetch).toHaveBeenCalledTimes(1);
    expect(GitCLIService.prototype.fetch).toHaveBeenCalledWith(cwd, "pull/2368/head:pr/2368");

    expect(GitCLIService.prototype.cherryPick).toHaveBeenCalledTimes(1);
    expect(GitCLIService.prototype.cherryPick).toHaveBeenCalledWith(cwd, "28f63db774185f4ec4b57cd9aaeb12dbfb4c9ecc", undefined, undefined, undefined);

    expect(GitCLIService.prototype.push).toHaveBeenCalledTimes(1);
    expect(GitCLIService.prototype.push).toHaveBeenCalledWith(cwd, "bp-target-28f63db");

    expect(GitHubClient.prototype.createPullRequest).toHaveBeenCalledTimes(1);
    expect(GitHubClient.prototype.createPullRequest).toHaveBeenCalledWith({
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
    expect(GitHubClient.prototype.createPullRequest).toHaveReturnedTimes(1);
  });

  test("with multiple target branches", async () => {
    spyGetInput({
      "target-branch": "v1, v2, v3",
      "pull-request": "https://github.com/owner/reponame/pull/2368",
      "folder": "/tmp/folder",
    });
    
    await runner.execute();

    const cwd = "/tmp/folder";

    expect(GitClientFactory.getOrCreate).toHaveBeenCalledTimes(1);
    expect(GitClientFactory.getOrCreate).toHaveBeenCalledWith(GitClientType.GITHUB, undefined, "https://api.github.com");

    expect(GitCLIService.prototype.clone).toHaveBeenCalledTimes(3);
    expect(GitCLIService.prototype.clone).toHaveBeenCalledWith("https://github.com/owner/reponame.git", cwd, "v1");
    expect(GitCLIService.prototype.clone).toHaveBeenCalledWith("https://github.com/owner/reponame.git", cwd, "v2");
    expect(GitCLIService.prototype.clone).toHaveBeenCalledWith("https://github.com/owner/reponame.git", cwd, "v3");

    expect(GitCLIService.prototype.createLocalBranch).toHaveBeenCalledTimes(3);
    expect(GitCLIService.prototype.createLocalBranch).toHaveBeenCalledWith(cwd, "bp-v1-28f63db");
    expect(GitCLIService.prototype.createLocalBranch).toHaveBeenCalledWith(cwd, "bp-v2-28f63db");
    expect(GitCLIService.prototype.createLocalBranch).toHaveBeenCalledWith(cwd, "bp-v3-28f63db");
    
    expect(GitCLIService.prototype.fetch).toHaveBeenCalledTimes(3);
    expect(GitCLIService.prototype.fetch).toHaveBeenCalledWith(cwd, "pull/2368/head:pr/2368");

    expect(GitCLIService.prototype.cherryPick).toHaveBeenCalledTimes(3);
    expect(GitCLIService.prototype.cherryPick).toHaveBeenCalledWith(cwd, "28f63db774185f4ec4b57cd9aaeb12dbfb4c9ecc", undefined, undefined, undefined);
    expect(GitCLIService.prototype.cherryPick).toHaveBeenCalledWith(cwd, "28f63db774185f4ec4b57cd9aaeb12dbfb4c9ecc", undefined, undefined, undefined);
    expect(GitCLIService.prototype.cherryPick).toHaveBeenCalledWith(cwd, "28f63db774185f4ec4b57cd9aaeb12dbfb4c9ecc", undefined, undefined, undefined);

    expect(GitCLIService.prototype.push).toHaveBeenCalledTimes(3);
    expect(GitCLIService.prototype.push).toHaveBeenCalledWith(cwd, "bp-v1-28f63db");
    expect(GitCLIService.prototype.push).toHaveBeenCalledWith(cwd, "bp-v2-28f63db");
    expect(GitCLIService.prototype.push).toHaveBeenCalledWith(cwd, "bp-v3-28f63db");

    expect(GitHubClient.prototype.createPullRequest).toHaveBeenCalledTimes(3);
    expect(GitHubClient.prototype.createPullRequest).toHaveBeenCalledWith({
        owner: "owner", 
        repo: "reponame", 
        head: "bp-v1-28f63db", 
        base: "v1", 
        title: "[v1] PR Title", 
        body: "**Backport:** https://github.com/owner/reponame/pull/2368\r\n\r\nPlease review and merge",
        reviewers: ["gh-user", "that-s-a-user"],
        assignees: [],
        labels: [],
        comments: [],
    });
    expect(GitHubClient.prototype.createPullRequest).toHaveBeenCalledWith({
        owner: "owner", 
        repo: "reponame", 
        head: "bp-v2-28f63db", 
        base: "v2", 
        title: "[v2] PR Title", 
        body: "**Backport:** https://github.com/owner/reponame/pull/2368\r\n\r\nPlease review and merge",
        reviewers: ["gh-user", "that-s-a-user"],
        assignees: [],
        labels: [],
        comments: [],
    });
    expect(GitHubClient.prototype.createPullRequest).toHaveBeenCalledWith({
        owner: "owner", 
        repo: "reponame", 
        head: "bp-v3-28f63db", 
        base: "v3", 
        title: "[v3] PR Title", 
        body: "**Backport:** https://github.com/owner/reponame/pull/2368\r\n\r\nPlease review and merge",
        reviewers: ["gh-user", "that-s-a-user"],
        assignees: [],
        labels: [],
        comments: [],
    });
    expect(GitHubClient.prototype.createPullRequest).toHaveReturnedTimes(3);
  });

  test("with multiple target branches and single custom bp branch", async () => {
    spyGetInput({
      "target-branch": "v1, v2, v3",
      "pull-request": "https://github.com/owner/reponame/pull/2368",
      "folder": "/tmp/folder",
      "bp-branch-name": "custom"
    });
    
    await runner.execute();

    const cwd = "/tmp/folder";

    expect(GitClientFactory.getOrCreate).toHaveBeenCalledTimes(1);
    expect(GitClientFactory.getOrCreate).toHaveBeenCalledWith(GitClientType.GITHUB, undefined, "https://api.github.com");

    expect(GitCLIService.prototype.clone).toHaveBeenCalledTimes(3);
    expect(GitCLIService.prototype.clone).toHaveBeenCalledWith("https://github.com/owner/reponame.git", cwd, "v1");
    expect(GitCLIService.prototype.clone).toHaveBeenCalledWith("https://github.com/owner/reponame.git", cwd, "v2");
    expect(GitCLIService.prototype.clone).toHaveBeenCalledWith("https://github.com/owner/reponame.git", cwd, "v3");

    expect(GitCLIService.prototype.createLocalBranch).toHaveBeenCalledTimes(3);
    expect(GitCLIService.prototype.createLocalBranch).toHaveBeenCalledWith(cwd, "custom-v1");
    expect(GitCLIService.prototype.createLocalBranch).toHaveBeenCalledWith(cwd, "custom-v2");
    expect(GitCLIService.prototype.createLocalBranch).toHaveBeenCalledWith(cwd, "custom-v3");
    
    expect(GitCLIService.prototype.fetch).toHaveBeenCalledTimes(3);
    expect(GitCLIService.prototype.fetch).toHaveBeenCalledWith(cwd, "pull/2368/head:pr/2368");

    expect(GitCLIService.prototype.cherryPick).toHaveBeenCalledTimes(3);
    expect(GitCLIService.prototype.cherryPick).toHaveBeenCalledWith(cwd, "28f63db774185f4ec4b57cd9aaeb12dbfb4c9ecc", undefined, undefined, undefined);
    expect(GitCLIService.prototype.cherryPick).toHaveBeenCalledWith(cwd, "28f63db774185f4ec4b57cd9aaeb12dbfb4c9ecc", undefined, undefined, undefined);
    expect(GitCLIService.prototype.cherryPick).toHaveBeenCalledWith(cwd, "28f63db774185f4ec4b57cd9aaeb12dbfb4c9ecc", undefined, undefined, undefined);

    expect(GitCLIService.prototype.push).toHaveBeenCalledTimes(3);
    expect(GitCLIService.prototype.push).toHaveBeenCalledWith(cwd, "custom-v1");
    expect(GitCLIService.prototype.push).toHaveBeenCalledWith(cwd, "custom-v2");
    expect(GitCLIService.prototype.push).toHaveBeenCalledWith(cwd, "custom-v3");

    expect(GitHubClient.prototype.createPullRequest).toHaveBeenCalledTimes(3);
    expect(GitHubClient.prototype.createPullRequest).toHaveBeenCalledWith({
        owner: "owner", 
        repo: "reponame", 
        head: "custom-v1", 
        base: "v1", 
        title: "[v1] PR Title", 
        body: "**Backport:** https://github.com/owner/reponame/pull/2368\r\n\r\nPlease review and merge",
        reviewers: ["gh-user", "that-s-a-user"],
        assignees: [],
        labels: [],
        comments: [],
    });
    expect(GitHubClient.prototype.createPullRequest).toHaveBeenCalledWith({
        owner: "owner", 
        repo: "reponame", 
        head: "custom-v2", 
        base: "v2", 
        title: "[v2] PR Title", 
        body: "**Backport:** https://github.com/owner/reponame/pull/2368\r\n\r\nPlease review and merge",
        reviewers: ["gh-user", "that-s-a-user"],
        assignees: [],
        labels: [],
        comments: [],
    });
    expect(GitHubClient.prototype.createPullRequest).toHaveBeenCalledWith({
        owner: "owner", 
        repo: "reponame", 
        head: "custom-v3", 
        base: "v3", 
        title: "[v3] PR Title", 
        body: "**Backport:** https://github.com/owner/reponame/pull/2368\r\n\r\nPlease review and merge",
        reviewers: ["gh-user", "that-s-a-user"],
        assignees: [],
        labels: [],
        comments: [],
    });
    expect(GitHubClient.prototype.createPullRequest).toHaveReturnedTimes(3);
  });

  test("explicitly set git client", async () => {
    spyGetInput({
      "target-branch": "target",
      "pull-request": "https://api.github.com/repos/owner/reponame/pulls/2368",
      "git-client": "codeberg",
    });

    await runner.execute();

    const cwd = process.cwd() + "/bp";

    expect(GitClientFactory.getOrCreate).toHaveBeenCalledTimes(1);
    expect(GitClientFactory.getOrCreate).toHaveBeenCalledWith(GitClientType.CODEBERG, undefined, "https://api.github.com");

    expect(GitCLIService.prototype.clone).toHaveBeenCalledTimes(1);
    expect(GitCLIService.prototype.clone).toHaveBeenCalledWith("https://github.com/owner/reponame.git", cwd, "target");
  });

});