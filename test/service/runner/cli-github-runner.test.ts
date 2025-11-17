import ArgsParser from "@bp/service/args/args-parser";
import Runner from "@bp/service/runner/runner";
import GitCLIService from "@bp/service/git/git-cli";
import GitHubClient from "@bp/service/git/github/github-client";
import CLIArgsParser from "@bp/service/args/cli/cli-args-parser";
import { addProcessArgs, createTestFile, removeTestFile, resetEnvTokens, resetProcessArgs } from "../../support/utils";
import { mockGitHubClient } from "../../support/mock/git-client-mock-support";
import GitClientFactory from "@bp/service/git/git-client-factory";
import { BackportPullRequest, GitClientType } from "@bp/service/git/git.types";
import { AuthTokenId } from "@bp/service/configs/configs.types";

const GITHUB_MERGED_PR_W_OVERRIDES_CONFIG_FILE_CONTENT_PATHNAME = "./cli-github-runner-pr-merged-with-overrides.json";
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
  "labels": ["cli github cherry pick :cherries:"],
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
  // reset process.env variables
  resetProcessArgs();

  // reset git env tokens
  resetEnvTokens();

  // mock octokit
  mockGitHubClient();

  // create CLI arguments parser
  parser = new CLIArgsParser();

  // create runner
  runner = new Runner(parser);
});

describe("cli runner", () => {

  test("with dry run", async () => {
    addProcessArgs([
      "-d",
      "-tb",
      "target",
      "-pr",
      "https://github.com/owner/reponame/pull/2368"
    ]);
    
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

  test("overriding author", async () => {
    addProcessArgs([
      "-d",
      "-tb",
      "target",
      "-pr",
      "https://github.com/owner/reponame/pull/2368"
    ]);
    
    await runner.execute();

    const cwd = process.cwd() + "/bp";

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
  });

  test("with relative folder", async () => {
    addProcessArgs([
      "-d",
      "-tb",
      "target",
      "-pr",
      "https://github.com/owner/reponame/pull/2368",
      "-f",
      "folder"
    ]);
    
    await runner.execute();

    const cwd = process.cwd() + "/folder";

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

    expect(GitCLIService.prototype.addRemote).toHaveBeenCalledTimes(0);
    expect(GitCLIService.prototype.addRemote).toHaveBeenCalledTimes(0);

    expect(GitCLIService.prototype.push).toHaveBeenCalledTimes(0);
    expect(GitHubClient.prototype.createPullRequest).toHaveBeenCalledTimes(0);
  });

  test("with absolute folder", async () => {
    addProcessArgs([
      "-d",
      "-tb",
      "target",
      "-pr",
      "https://github.com/owner/reponame/pull/2368",
      "-f",
      "/tmp/folder"
    ]);
    
    await runner.execute();

    const cwd = "/tmp/folder";

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
  });

  test("without dry run", async () => {
    addProcessArgs([
      "-tb",
      "target",
      "-pr",
      "https://github.com/owner/reponame/pull/2368"
    ]);
    
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

  test("same owner", async () => {
    addProcessArgs([
      "-tb",
      "target",
      "-pr",
      "https://github.com/owner/reponame/pull/8632"
    ]);
    
    await runner.execute();

    const cwd = process.cwd() + "/bp";

    expect(GitClientFactory.getOrCreate).toHaveBeenCalledTimes(1);
    expect(GitClientFactory.getOrCreate).toHaveBeenCalledWith(GitClientType.GITHUB, undefined, "https://api.github.com");

    expect(GitCLIService.prototype.clone).toHaveBeenCalledTimes(1);
    expect(GitCLIService.prototype.clone).toHaveBeenCalledWith("https://github.com/owner/reponame.git", cwd, "target");

    expect(GitCLIService.prototype.createLocalBranch).toHaveBeenCalledTimes(1);
    expect(GitCLIService.prototype.createLocalBranch).toHaveBeenCalledWith(cwd, "bp-target-28f63db");
    
    expect(GitCLIService.prototype.fetch).toHaveBeenCalledTimes(0);

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
        body: "**Backport:** https://github.com/owner/reponame/pull/8632\r\n\r\nPlease review and merge",
        reviewers: ["gh-user", "that-s-a-user"],
        assignees: [],
        labels: [],
        comments: [],
      }
    );
    expect(GitHubClient.prototype.createPullRequest).toHaveReturnedTimes(1);
    expect(GitHubClient.prototype.createPullRequestComment).toHaveBeenCalledTimes(0);
  });

  test("closed and not merged pull request", async () => {
    addProcessArgs([
      "-tb",
      "target",
      "-pr",
      "https://github.com/owner/reponame/pull/6666"
    ]);

    await expect(() => runner.execute()).rejects.toThrow("Provided pull request is closed and not merged");
  });

  test("open pull request simple", async () => {
    addProcessArgs([
      "-tb",
      "target",
      "-pr",
      "https://github.com/owner/reponame/pull/4444"
    ]);

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

  test("open pull request with --auto-no-squash", async () => {
    addProcessArgs([
      "-tb",
      "target",
      "-pr",
      "https://github.com/owner/reponame/pull/4444",
      "--auto-no-squash",
    ]);

    await runner.execute();

    const cwd = process.cwd() + "/bp";

    expect(GitClientFactory.getOrCreate).toHaveBeenCalledTimes(1);
    expect(GitClientFactory.getOrCreate).toHaveBeenCalledWith(GitClientType.GITHUB, undefined, "https://api.github.com");

    expect(GitCLIService.prototype.clone).toHaveBeenCalledTimes(1);
    expect(GitCLIService.prototype.clone).toHaveBeenCalledWith("https://github.com/owner/reponame.git", cwd, "target");

    expect(GitCLIService.prototype.createLocalBranch).toHaveBeenCalledTimes(1);
    expect(GitCLIService.prototype.createLocalBranch).toHaveBeenCalledWith(cwd, "bp-target-0404fb9-11da4e3");

    expect(GitCLIService.prototype.fetch).toHaveBeenCalledTimes(1);
    expect(GitCLIService.prototype.fetch).toHaveBeenCalledWith(cwd, "pull/4444/head:pr/4444");

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
    addProcessArgs([
      "-tb",
      "target",
      "-pr",
      "https://github.com/owner/reponame/pull/2368",
      "--title",
      "New Title",
      "--body",
      "New Body",
      "--body-prefix",
      "New Body Prefix\\r\\n\\r\\n",
      "--bp-branch-name",
      "bp_branch_name",
      "--reviewers",
      "user1,user2",
      "--assignees",
      "user3,user4",
    ]);
    
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
    addProcessArgs([
      "-tb",
      "target",
      "-pr",
      "https://github.com/owner/reponame/pull/2368",
      "--title",
      "New Title",
      "--body",
      "New Body",
      "--body-prefix",
      "New Body Prefix - ",
      "--bp-branch-name",
      "bp_branch_name",
      "--no-inherit-reviewers",
      "--assignees",
      "user3,user4",
    ]);
    
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
    addProcessArgs([
      "-tb",
      "target",
      "-pr",
      "https://github.com/owner/reponame/pull/2368",
      "--labels",
      "cherry-pick :cherries:, backport prod",
      "--inherit-labels",
    ]);
    
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
        labels: ["cherry-pick :cherries:", "backport prod"],
        comments: [],
      }
    );
    expect(GitHubClient.prototype.createPullRequest).toHaveReturnedTimes(1);
  });

  test("set custom labels without inheritance", async () => {
    addProcessArgs([
      "-tb",
      "target",
      "-pr",
      "https://github.com/owner/reponame/pull/2368",
      "--labels",
      "first-label, second-label ",
    ]);
    
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
        labels: ["first-label", "second-label"],
        comments: [],
      }
    );
    expect(GitHubClient.prototype.createPullRequest).toHaveReturnedTimes(1);
  });

  test("using config file with overrides", async () => {
    addProcessArgs([
      "--config-file",
      GITHUB_MERGED_PR_W_OVERRIDES_CONFIG_FILE_CONTENT_PATHNAME,
    ]);
    
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
        labels: ["cli github cherry pick :cherries:", "backport prod"],
        comments: [],
      }
    );
    expect(GitHubClient.prototype.createPullRequest).toHaveReturnedTimes(1);
  });

  // to check: https://github.com/kiegroup/git-backporting/issues/52
  test("using github api url instead of html one", async () => {
    addProcessArgs([
      "-tb",
      "target",
      "-pr",
      "https://api.github.com/repos/owner/reponame/pulls/2368"
    ]);
    
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
    addProcessArgs([
      "-tb",
      "target",
      "-pr",
      "https://github.com/owner/reponame/pull/8632",
      "--no-squash",
    ]);
    
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

  test("too long bp branch name", async () => {
    // 260 chars
    const tooLongBranchName = "too-long-branch-name".repeat(13);

    addProcessArgs([
      "-tb",
      "target",
      "-pr",
      "https://github.com/owner/reponame/pull/2368",
      "--bp-branch-name",
      tooLongBranchName,
    ]);
    
    await runner.execute();

    const cwd = process.cwd() + "/bp";

    const truncatedBranch = tooLongBranchName.slice(0, 250);

    expect(GitClientFactory.getOrCreate).toHaveBeenCalledTimes(1);
    expect(GitClientFactory.getOrCreate).toHaveBeenCalledWith(GitClientType.GITHUB, undefined, "https://api.github.com");

    expect(GitCLIService.prototype.clone).toHaveBeenCalledTimes(1);
    expect(GitCLIService.prototype.clone).toHaveBeenCalledWith("https://github.com/owner/reponame.git", cwd, "target");

    expect(GitCLIService.prototype.createLocalBranch).toHaveBeenCalledTimes(1);
    expect(GitCLIService.prototype.createLocalBranch).toHaveBeenCalledWith(cwd, truncatedBranch);
    
    expect(GitCLIService.prototype.fetch).toHaveBeenCalledTimes(1);
    expect(GitCLIService.prototype.fetch).toHaveBeenCalledWith(cwd, "pull/2368/head:pr/2368");

    expect(GitCLIService.prototype.cherryPick).toHaveBeenCalledTimes(1);
    expect(GitCLIService.prototype.cherryPick).toHaveBeenCalledWith(cwd, "28f63db774185f4ec4b57cd9aaeb12dbfb4c9ecc", undefined, undefined, undefined);

    expect(GitCLIService.prototype.push).toHaveBeenCalledTimes(1);
    expect(GitCLIService.prototype.push).toHaveBeenCalledWith(cwd, truncatedBranch);

    expect(GitHubClient.prototype.createPullRequest).toHaveBeenCalledTimes(1);
    expect(GitHubClient.prototype.createPullRequest).toHaveBeenCalledWith({
        owner: "owner", 
        repo: "reponame", 
        head: truncatedBranch, 
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

  test("multiple commits pr with different strategy", async () => {
    addProcessArgs([
      "-tb",
      "target",
      "-pr",
      "https://github.com/owner/reponame/pull/8632",
      "--no-squash",
      "--strategy",
      "ort",
      "--strategy-option",
      "find-renames",
    ]);
    
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
    expect(GitCLIService.prototype.cherryPick).toHaveBeenCalledWith(cwd, "0404fb922ab75c3a8aecad5c97d9af388df04695", "ort", "find-renames", undefined);
    expect(GitCLIService.prototype.cherryPick).toHaveBeenLastCalledWith(cwd, "11da4e38aa3e577ffde6d546f1c52e53b04d3151", "ort", "find-renames", undefined);

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

  test("additional pr comments", async () => {
    addProcessArgs([
      "-tb",
      "target",
      "-pr",
      "https://github.com/owner/reponame/pull/8632",
      "--comments",
      "first comment; second comment",
      "--body",
      "New body"
    ]);
    
    await runner.execute();

    const cwd = process.cwd() + "/bp";

    expect(GitClientFactory.getOrCreate).toHaveBeenCalledTimes(1);
    expect(GitClientFactory.getOrCreate).toHaveBeenCalledWith(GitClientType.GITHUB, undefined, "https://api.github.com");

    expect(GitCLIService.prototype.clone).toHaveBeenCalledTimes(1);
    expect(GitCLIService.prototype.clone).toHaveBeenCalledWith("https://github.com/owner/reponame.git", cwd, "target");

    expect(GitCLIService.prototype.createLocalBranch).toHaveBeenCalledTimes(1);
    expect(GitCLIService.prototype.createLocalBranch).toHaveBeenCalledWith(cwd, "bp-target-28f63db");
    
    expect(GitCLIService.prototype.fetch).toHaveBeenCalledTimes(0);

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
        body: "**Backport:** https://github.com/owner/reponame/pull/8632\r\n\r\nNew body",
        reviewers: ["gh-user", "that-s-a-user"],
        assignees: [],
        labels: [],
        comments: ["first comment", "second comment"],
      }
    );
    expect(GitHubClient.prototype.createPullRequest).toHaveReturnedTimes(1);
  });

  test("with multiple target branches", async () => {
    addProcessArgs([
      "-tb",
      "v1, v2, v3",
      "-pr",
      "https://github.com/owner/reponame/pull/2368",
      "-f",
      "/tmp/folder"
    ]);
    
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

  test("with multiple target branches and multiple bp names", async () => {
    addProcessArgs([
      "-tb",
      "v1, v2, v3",
      "-pr",
      "https://github.com/owner/reponame/pull/2368",
      "-f",
      "/tmp/folder",
      "--bp-branch-name",
      "custom1, custom1, custom2, custom3",
    ]);
    
    await runner.execute();

    const cwd = "/tmp/folder";

    expect(GitClientFactory.getOrCreate).toHaveBeenCalledTimes(1);
    expect(GitClientFactory.getOrCreate).toHaveBeenCalledWith(GitClientType.GITHUB, undefined, "https://api.github.com");

    expect(GitCLIService.prototype.clone).toHaveBeenCalledTimes(3);
    expect(GitCLIService.prototype.clone).toHaveBeenCalledWith("https://github.com/owner/reponame.git", cwd, "v1");
    expect(GitCLIService.prototype.clone).toHaveBeenCalledWith("https://github.com/owner/reponame.git", cwd, "v2");
    expect(GitCLIService.prototype.clone).toHaveBeenCalledWith("https://github.com/owner/reponame.git", cwd, "v3");

    expect(GitCLIService.prototype.createLocalBranch).toHaveBeenCalledTimes(3);
    expect(GitCLIService.prototype.createLocalBranch).toHaveBeenCalledWith(cwd, "custom1");
    expect(GitCLIService.prototype.createLocalBranch).toHaveBeenCalledWith(cwd, "custom2");
    expect(GitCLIService.prototype.createLocalBranch).toHaveBeenCalledWith(cwd, "custom3");
    
    expect(GitCLIService.prototype.fetch).toHaveBeenCalledTimes(3);
    expect(GitCLIService.prototype.fetch).toHaveBeenCalledWith(cwd, "pull/2368/head:pr/2368");

    expect(GitCLIService.prototype.cherryPick).toHaveBeenCalledTimes(3);
    expect(GitCLIService.prototype.cherryPick).toHaveBeenCalledWith(cwd, "28f63db774185f4ec4b57cd9aaeb12dbfb4c9ecc", undefined, undefined, undefined);
    expect(GitCLIService.prototype.cherryPick).toHaveBeenCalledWith(cwd, "28f63db774185f4ec4b57cd9aaeb12dbfb4c9ecc", undefined, undefined, undefined);
    expect(GitCLIService.prototype.cherryPick).toHaveBeenCalledWith(cwd, "28f63db774185f4ec4b57cd9aaeb12dbfb4c9ecc", undefined, undefined, undefined);

    expect(GitCLIService.prototype.push).toHaveBeenCalledTimes(3);
    expect(GitCLIService.prototype.push).toHaveBeenCalledWith(cwd, "custom1");
    expect(GitCLIService.prototype.push).toHaveBeenCalledWith(cwd, "custom2");
    expect(GitCLIService.prototype.push).toHaveBeenCalledWith(cwd, "custom3");

    expect(GitHubClient.prototype.createPullRequest).toHaveBeenCalledTimes(3);
    expect(GitHubClient.prototype.createPullRequest).toHaveBeenCalledWith({
        owner: "owner", 
        repo: "reponame", 
        head: "custom1", 
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
        head: "custom2", 
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
        head: "custom3", 
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

  test("with multiple target branches and one failure", async () => {
    const createPullRequestSpy = jest.spyOn(GitHubClient.prototype, "createPullRequest").mockImplementation((_backport: BackportPullRequest) => {
      throw new Error("Mocked error");
    });

    addProcessArgs([
      "-tb",
      "v1, v2, v3",
      "-pr",
      "https://github.com/owner/reponame/pull/2368",
      "-f",
      "/tmp/folder",
      "--bp-branch-name",
      "custom-failure-head",
    ]);
    
    await expect(() => runner.execute()).rejects.toThrow("Failure occurred during one of the backports: [Error: Mocked error ; Error: Mocked error ; Error: Mocked error]");

    const cwd = "/tmp/folder";

    expect(GitClientFactory.getOrCreate).toHaveBeenCalledTimes(1);
    expect(GitClientFactory.getOrCreate).toHaveBeenCalledWith(GitClientType.GITHUB, undefined, "https://api.github.com");

    expect(GitCLIService.prototype.clone).toHaveBeenCalledTimes(3);
    expect(GitCLIService.prototype.clone).toHaveBeenCalledWith("https://github.com/owner/reponame.git", cwd, "v1");
    expect(GitCLIService.prototype.clone).toHaveBeenCalledWith("https://github.com/owner/reponame.git", cwd, "v2");
    expect(GitCLIService.prototype.clone).toHaveBeenCalledWith("https://github.com/owner/reponame.git", cwd, "v3");

    expect(GitCLIService.prototype.createLocalBranch).toHaveBeenCalledTimes(3);
    expect(GitCLIService.prototype.createLocalBranch).toHaveBeenCalledWith(cwd, "custom-failure-head-v1");
    expect(GitCLIService.prototype.createLocalBranch).toHaveBeenCalledWith(cwd, "custom-failure-head-v2");
    expect(GitCLIService.prototype.createLocalBranch).toHaveBeenCalledWith(cwd, "custom-failure-head-v3");
    
    expect(GitCLIService.prototype.fetch).toHaveBeenCalledTimes(3);
    expect(GitCLIService.prototype.fetch).toHaveBeenCalledWith(cwd, "pull/2368/head:pr/2368");

    expect(GitCLIService.prototype.cherryPick).toHaveBeenCalledTimes(3);
    expect(GitCLIService.prototype.cherryPick).toHaveBeenCalledWith(cwd, "28f63db774185f4ec4b57cd9aaeb12dbfb4c9ecc", undefined, undefined, undefined);
    expect(GitCLIService.prototype.cherryPick).toHaveBeenCalledWith(cwd, "28f63db774185f4ec4b57cd9aaeb12dbfb4c9ecc", undefined, undefined, undefined);
    expect(GitCLIService.prototype.cherryPick).toHaveBeenCalledWith(cwd, "28f63db774185f4ec4b57cd9aaeb12dbfb4c9ecc", undefined, undefined, undefined);

    expect(GitCLIService.prototype.push).toHaveBeenCalledTimes(3);
    expect(GitCLIService.prototype.push).toHaveBeenCalledWith(cwd, "custom-failure-head-v1");
    expect(GitCLIService.prototype.push).toHaveBeenCalledWith(cwd, "custom-failure-head-v2");
    expect(GitCLIService.prototype.push).toHaveBeenCalledWith(cwd, "custom-failure-head-v3");

    expect(GitHubClient.prototype.createPullRequest).toHaveBeenCalledTimes(3);
    expect(GitHubClient.prototype.createPullRequest).toHaveBeenCalledWith({
        owner: "owner", 
        repo: "reponame", 
        head: "custom-failure-head-v1", 
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
        head: "custom-failure-head-v2", 
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
        head: "custom-failure-head-v3", 
        base: "v3", 
        title: "[v3] PR Title", 
        body: "**Backport:** https://github.com/owner/reponame/pull/2368\r\n\r\nPlease review and merge",
        reviewers: ["gh-user", "that-s-a-user"],
        assignees: [],
        labels: [],
        comments: [],
    });
    expect(GitHubClient.prototype.createPullRequest).toThrow();
    expect(GitHubClient.prototype.createPullRequestComment).toHaveBeenCalledTimes(0);

    createPullRequestSpy.mockReset();
  });

  test("auth using GITHUB_TOKEN takes precedence over GIT_TOKEN env variable", async () => {
    process.env[AuthTokenId.GIT_TOKEN] = "mygittoken";
    process.env[AuthTokenId.GITHUB_TOKEN] = "mygithubtoken";
    addProcessArgs([
      "-tb",
      "target",
      "-pr",
      "https://github.com/owner/reponame/pull/8632"
    ]);
    
    await runner.execute();

    expect(GitClientFactory.getOrCreate).toHaveBeenCalledTimes(1);
    expect(GitClientFactory.getOrCreate).toHaveBeenCalledWith(GitClientType.GITHUB, "mygithubtoken", "https://api.github.com");

    // Not interested in all subsequent calls, already tested in other test cases
  });

  test("auth arg takes precedence over GITHUB_TOKEN", async () => {
    process.env[AuthTokenId.GITHUB_TOKEN] = "mygithubtoken";
    addProcessArgs([
      "-tb",
      "target",
      "-pr",
      "https://github.com/owner/reponame/pull/8632",
      "-a",
      "mytoken"
    ]);
    
    await runner.execute();

    expect(GitClientFactory.getOrCreate).toHaveBeenCalledTimes(1);
    expect(GitClientFactory.getOrCreate).toHaveBeenCalledWith(GitClientType.GITHUB, "mytoken", "https://api.github.com");

    // Not interested in all subsequent calls, already tested in other test cases
  });

  test("ignore env variables related to other git platforms", async () => {
    process.env[AuthTokenId.GITLAB_TOKEN] = "mygitlabtoken";
    process.env[AuthTokenId.CODEBERG_TOKEN] = "mycodebergtoken";
    addProcessArgs([
      "-tb",
      "target",
      "-pr",
      "https://github.com/owner/reponame/pull/8632"
    ]);
    
    await runner.execute();

    expect(GitClientFactory.getOrCreate).toHaveBeenCalledTimes(1);
    expect(GitClientFactory.getOrCreate).toHaveBeenCalledWith(GitClientType.GITHUB, undefined, "https://api.github.com");

    // Not interested in all subsequent calls, already tested in other test cases
  });

  test("extract target branch from label", async () => {
    addProcessArgs([
      "--target-branch-pattern",
      "^backport (?<target>([^ ]+))$",
      "-pr",
      "https://github.com/owner/reponame/pull/2368"
    ]);
    
    await runner.execute();

    const cwd = process.cwd() + "/bp";

    expect(GitClientFactory.getOrCreate).toHaveBeenCalledTimes(1);
    expect(GitClientFactory.getOrCreate).toHaveBeenCalledWith(GitClientType.GITHUB, undefined, "https://api.github.com");

    expect(GitCLIService.prototype.clone).toHaveBeenCalledTimes(1);
    expect(GitCLIService.prototype.clone).toHaveBeenCalledWith("https://github.com/owner/reponame.git", cwd, "prod");
  });

  test("with multiple target branches, one failure and error notification enabled", async () => {
    const createPullRequestSpy = jest.spyOn(GitHubClient.prototype, "createPullRequest").mockImplementation((backport: BackportPullRequest) => {
      throw new Error(`Mocked error: ${backport.base}`);
    });

    addProcessArgs([
      "-tb",
      "v1, v2, v3",
      "-pr",
      "https://github.com/owner/reponame/pull/2368",
      "-f",
      "/tmp/folder",
      "--bp-branch-name",
      "custom-failure-head",
      "--enable-err-notification",
    ]);
    
    await expect(() => runner.execute()).rejects.toThrow("Failure occurred during one of the backports: [Error: Mocked error: v1 ; Error: Mocked error: v2 ; Error: Mocked error: v3]");

    const cwd = "/tmp/folder";

    expect(GitClientFactory.getOrCreate).toHaveBeenCalledTimes(1);
    expect(GitClientFactory.getOrCreate).toHaveBeenCalledWith(GitClientType.GITHUB, undefined, "https://api.github.com");

    expect(GitCLIService.prototype.clone).toHaveBeenCalledTimes(3);
    expect(GitCLIService.prototype.clone).toHaveBeenCalledWith("https://github.com/owner/reponame.git", cwd, "v1");
    expect(GitCLIService.prototype.clone).toHaveBeenCalledWith("https://github.com/owner/reponame.git", cwd, "v2");
    expect(GitCLIService.prototype.clone).toHaveBeenCalledWith("https://github.com/owner/reponame.git", cwd, "v3");

    expect(GitCLIService.prototype.createLocalBranch).toHaveBeenCalledTimes(3);
    expect(GitCLIService.prototype.createLocalBranch).toHaveBeenCalledWith(cwd, "custom-failure-head-v1");
    expect(GitCLIService.prototype.createLocalBranch).toHaveBeenCalledWith(cwd, "custom-failure-head-v2");
    expect(GitCLIService.prototype.createLocalBranch).toHaveBeenCalledWith(cwd, "custom-failure-head-v3");
    
    expect(GitCLIService.prototype.fetch).toHaveBeenCalledTimes(3);
    expect(GitCLIService.prototype.fetch).toHaveBeenCalledWith(cwd, "pull/2368/head:pr/2368");

    expect(GitCLIService.prototype.cherryPick).toHaveBeenCalledTimes(3);
    expect(GitCLIService.prototype.cherryPick).toHaveBeenCalledWith(cwd, "28f63db774185f4ec4b57cd9aaeb12dbfb4c9ecc", undefined, undefined, undefined);
    expect(GitCLIService.prototype.cherryPick).toHaveBeenCalledWith(cwd, "28f63db774185f4ec4b57cd9aaeb12dbfb4c9ecc", undefined, undefined, undefined);
    expect(GitCLIService.prototype.cherryPick).toHaveBeenCalledWith(cwd, "28f63db774185f4ec4b57cd9aaeb12dbfb4c9ecc", undefined, undefined, undefined);

    expect(GitCLIService.prototype.push).toHaveBeenCalledTimes(3);
    expect(GitCLIService.prototype.push).toHaveBeenCalledWith(cwd, "custom-failure-head-v1");
    expect(GitCLIService.prototype.push).toHaveBeenCalledWith(cwd, "custom-failure-head-v2");
    expect(GitCLIService.prototype.push).toHaveBeenCalledWith(cwd, "custom-failure-head-v3");

    expect(GitHubClient.prototype.createPullRequest).toHaveBeenCalledTimes(3);
    expect(GitHubClient.prototype.createPullRequest).toHaveBeenCalledWith({
        owner: "owner", 
        repo: "reponame", 
        head: "custom-failure-head-v1", 
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
        head: "custom-failure-head-v2", 
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
        head: "custom-failure-head-v3", 
        base: "v3", 
        title: "[v3] PR Title", 
        body: "**Backport:** https://github.com/owner/reponame/pull/2368\r\n\r\nPlease review and merge",
        reviewers: ["gh-user", "that-s-a-user"],
        assignees: [],
        labels: [],
        comments: [],
    });
    expect(GitHubClient.prototype.createPullRequest).toThrow();
    expect(GitHubClient.prototype.createPullRequestComment).toHaveBeenCalledTimes(3);
    expect(GitHubClient.prototype.createPullRequestComment).toHaveBeenCalledWith("https://api.github.com/repos/owner/reponame/pulls/2368", "The backport to `v1` failed. Check the latest run for more details.");
    expect(GitHubClient.prototype.createPullRequestComment).toHaveBeenCalledWith("https://api.github.com/repos/owner/reponame/pulls/2368", "The backport to `v2` failed. Check the latest run for more details.");
    expect(GitHubClient.prototype.createPullRequestComment).toHaveBeenCalledWith("https://api.github.com/repos/owner/reponame/pulls/2368", "The backport to `v3` failed. Check the latest run for more details.");

    createPullRequestSpy.mockReset();
  });

  test("with some failures and dry run enabled", async () => {
    const cherryPickSpy = jest.spyOn(GitCLIService.prototype, "cherryPick").mockImplementation((cwd: string, sha: string) => {
      throw new Error(`Forced error: ${sha}`);
    });

    addProcessArgs([
      "-tb",
      "v1, v2, v3",
      "-pr",
      "https://github.com/owner/reponame/pull/2368",
      "-f",
      "/tmp/folder",
      "--bp-branch-name",
      "custom-failure-head",
      "--enable-err-notification",
      "--dry-run",
    ]);

    await expect(() => runner.execute()).rejects.toThrow("Failure occurred during one of the backports: [Error: Forced error: 28f63db774185f4ec4b57cd9aaeb12dbfb4c9ecc ; Error: Forced error: 28f63db774185f4ec4b57cd9aaeb12dbfb4c9ecc ; Error: Forced error: 28f63db774185f4ec4b57cd9aaeb12dbfb4c9ecc]");

    const cwd = "/tmp/folder";

    expect(GitClientFactory.getOrCreate).toHaveBeenCalledTimes(1);
    expect(GitClientFactory.getOrCreate).toHaveBeenCalledWith(GitClientType.GITHUB, undefined, "https://api.github.com");

    expect(GitCLIService.prototype.clone).toHaveBeenCalledTimes(3);
    expect(GitCLIService.prototype.clone).toHaveBeenCalledWith("https://github.com/owner/reponame.git", cwd, "v1");
    expect(GitCLIService.prototype.clone).toHaveBeenCalledWith("https://github.com/owner/reponame.git", cwd, "v2");
    expect(GitCLIService.prototype.clone).toHaveBeenCalledWith("https://github.com/owner/reponame.git", cwd, "v3");

    expect(GitCLIService.prototype.createLocalBranch).toHaveBeenCalledTimes(3);
    expect(GitCLIService.prototype.createLocalBranch).toHaveBeenCalledWith(cwd, "custom-failure-head-v1");
    expect(GitCLIService.prototype.createLocalBranch).toHaveBeenCalledWith(cwd, "custom-failure-head-v2");
    expect(GitCLIService.prototype.createLocalBranch).toHaveBeenCalledWith(cwd, "custom-failure-head-v3");

    expect(GitCLIService.prototype.fetch).toHaveBeenCalledTimes(3);
    expect(GitCLIService.prototype.fetch).toHaveBeenCalledWith(cwd, "pull/2368/head:pr/2368");

    expect(GitCLIService.prototype.cherryPick).toHaveBeenCalledTimes(3);
    expect(GitCLIService.prototype.cherryPick).toThrow();

    expect(GitCLIService.prototype.push).toHaveBeenCalledTimes(0);

    expect(GitHubClient.prototype.createPullRequest).toHaveBeenCalledTimes(0);
    expect(GitHubClient.prototype.createPullRequestComment).toHaveBeenCalledTimes(0);

    cherryPickSpy.mockReset();
  });
});
