import ArgsParser from "@bp/service/args/args-parser";
import Runner from "@bp/service/runner/runner";
import GitCLIService from "@bp/service/git/git-cli";
import GitHubClient from "@bp/service/git/github/github-client";
import GHAArgsParser from "@bp/service/args/gha/gha-args-parser";
import { createTestFile, removeTestFile, spyGetInput } from "../../support/utils";
import { mockGitHubClient } from "../../support/mock/git-client-mock-support";

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
};


jest.mock("@bp/service/git/git-cli");
jest.spyOn(GitHubClient.prototype, "createPullRequest");

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

afterEach(() => {
  jest.clearAllMocks();
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

    expect(GitCLIService.prototype.clone).toBeCalledTimes(1);
    expect(GitCLIService.prototype.clone).toBeCalledWith("https://github.com/owner/reponame.git", cwd, "target");

    expect(GitCLIService.prototype.createLocalBranch).toBeCalledTimes(1);
    expect(GitCLIService.prototype.createLocalBranch).toBeCalledWith(cwd, "bp-target-28f63db774185f4ec4b57cd9aaeb12dbfb4c9ecc");
    
    expect(GitCLIService.prototype.fetch).toBeCalledTimes(1);
    expect(GitCLIService.prototype.fetch).toBeCalledWith(cwd, "pull/2368/head:pr/2368");

    expect(GitCLIService.prototype.cherryPick).toBeCalledTimes(1);
    expect(GitCLIService.prototype.cherryPick).toBeCalledWith(cwd, "28f63db774185f4ec4b57cd9aaeb12dbfb4c9ecc");

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

    expect(GitCLIService.prototype.clone).toBeCalledTimes(1);
    expect(GitCLIService.prototype.clone).toBeCalledWith("https://github.com/owner/reponame.git", cwd, "target");

    expect(GitCLIService.prototype.createLocalBranch).toBeCalledTimes(1);
    expect(GitCLIService.prototype.createLocalBranch).toBeCalledWith(cwd, "bp-target-28f63db774185f4ec4b57cd9aaeb12dbfb4c9ecc");
    
    expect(GitCLIService.prototype.fetch).toBeCalledTimes(1);
    expect(GitCLIService.prototype.fetch).toBeCalledWith(cwd, "pull/2368/head:pr/2368");

    expect(GitCLIService.prototype.cherryPick).toBeCalledTimes(1);
    expect(GitCLIService.prototype.cherryPick).toBeCalledWith(cwd, "28f63db774185f4ec4b57cd9aaeb12dbfb4c9ecc");

    expect(GitCLIService.prototype.push).toBeCalledTimes(1);
    expect(GitCLIService.prototype.push).toBeCalledWith(cwd, "bp-target-28f63db774185f4ec4b57cd9aaeb12dbfb4c9ecc");

    expect(GitHubClient.prototype.createPullRequest).toBeCalledTimes(1);
    expect(GitHubClient.prototype.createPullRequest).toBeCalledWith({
        owner: "owner", 
        repo: "reponame", 
        head: "bp-target-28f63db774185f4ec4b57cd9aaeb12dbfb4c9ecc", 
        base: "target", 
        title: "[target] PR Title", 
        body: expect.stringContaining("**Backport:** https://github.com/owner/reponame/pull/2368"),
        reviewers: ["gh-user", "that-s-a-user"],
        assignees: [],
      }
    );
  });

  test("closed and not merged pull request", async () => {
    spyGetInput({
      "target-branch": "target",
      "pull-request": "https://github.com/owner/reponame/pull/6666"
    });

    expect(async () => await runner.execute()).rejects.toThrow("Provided pull request is closed and not merged!");
  });

  test("open pull request", async () => {
    spyGetInput({
      "target-branch": "target",
      "pull-request": "https://github.com/owner/reponame/pull/4444"
    });

    await runner.execute();

    const cwd = process.cwd() + "/bp";

    expect(GitCLIService.prototype.clone).toBeCalledTimes(1);
    expect(GitCLIService.prototype.clone).toBeCalledWith("https://github.com/owner/reponame.git", cwd, "target");

    expect(GitCLIService.prototype.createLocalBranch).toBeCalledTimes(1);
    expect(GitCLIService.prototype.createLocalBranch).toBeCalledWith(cwd, "bp-target-91748965051fae1330ad58d15cf694e103267c87");
    
    expect(GitCLIService.prototype.fetch).toBeCalledTimes(1);
    expect(GitCLIService.prototype.fetch).toBeCalledWith(cwd, "pull/4444/head:pr/4444");

    expect(GitCLIService.prototype.cherryPick).toBeCalledTimes(1);
    expect(GitCLIService.prototype.cherryPick).toBeCalledWith(cwd, "91748965051fae1330ad58d15cf694e103267c87");

    expect(GitCLIService.prototype.push).toBeCalledTimes(1);
    expect(GitCLIService.prototype.push).toBeCalledWith(cwd, "bp-target-91748965051fae1330ad58d15cf694e103267c87");

    expect(GitHubClient.prototype.createPullRequest).toBeCalledTimes(1);
    expect(GitHubClient.prototype.createPullRequest).toBeCalledWith({
        owner: "owner", 
        repo: "reponame", 
        head: "bp-target-91748965051fae1330ad58d15cf694e103267c87", 
        base: "target", 
        title: "[target] PR Title", 
        body: expect.stringContaining("**Backport:** https://github.com/owner/reponame/pull/4444"),
        reviewers: ["gh-user"],
        assignees: [],
      }
    );
  });

  test("override backporting pr data", async () => {
    spyGetInput({
      "target-branch": "target",
      "pull-request": "https://github.com/owner/reponame/pull/2368",
      "title": "New Title",
      "body": "New Body",
      "body-prefix": "New Body Prefix - ",
      "bp-branch-name": "bp_branch_name",
      "reviewers": "user1, user2",
      "assignees": "user3, user4",
    });

    await runner.execute();

    const cwd = process.cwd() + "/bp";

    expect(GitCLIService.prototype.clone).toBeCalledTimes(1);
    expect(GitCLIService.prototype.clone).toBeCalledWith("https://github.com/owner/reponame.git", cwd, "target");

    expect(GitCLIService.prototype.createLocalBranch).toBeCalledTimes(1);
    expect(GitCLIService.prototype.createLocalBranch).toBeCalledWith(cwd, "bp_branch_name");
    
    expect(GitCLIService.prototype.fetch).toBeCalledTimes(1);
    expect(GitCLIService.prototype.fetch).toBeCalledWith(cwd, "pull/2368/head:pr/2368");

    expect(GitCLIService.prototype.cherryPick).toBeCalledTimes(1);
    expect(GitCLIService.prototype.cherryPick).toBeCalledWith(cwd, "28f63db774185f4ec4b57cd9aaeb12dbfb4c9ecc");

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
        reviewers: ["user1", "user2"],
        assignees: ["user3", "user4"],
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

    expect(GitCLIService.prototype.clone).toBeCalledTimes(1);
    expect(GitCLIService.prototype.clone).toBeCalledWith("https://github.com/owner/reponame.git", cwd, "target");

    expect(GitCLIService.prototype.createLocalBranch).toBeCalledTimes(1);
    expect(GitCLIService.prototype.createLocalBranch).toBeCalledWith(cwd, "bp_branch_name");
    
    expect(GitCLIService.prototype.fetch).toBeCalledTimes(1);
    expect(GitCLIService.prototype.fetch).toBeCalledWith(cwd, "pull/2368/head:pr/2368");

    expect(GitCLIService.prototype.cherryPick).toBeCalledTimes(1);
    expect(GitCLIService.prototype.cherryPick).toBeCalledWith(cwd, "28f63db774185f4ec4b57cd9aaeb12dbfb4c9ecc");

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
      }
    );
  });

  test("using config file with overrides", async () => {
    spyGetInput({
      "config-file": GITHUB_MERGED_PR_W_OVERRIDES_CONFIG_FILE_CONTENT_PATHNAME,
    });
    
    await runner.execute();

    const cwd = process.cwd() + "/bp";

    expect(GitCLIService.prototype.clone).toBeCalledTimes(1);
    expect(GitCLIService.prototype.clone).toBeCalledWith("https://github.com/owner/reponame.git", cwd, "target");

    expect(GitCLIService.prototype.createLocalBranch).toBeCalledTimes(1);
    expect(GitCLIService.prototype.createLocalBranch).toBeCalledWith(cwd, "bp_branch_name");
    
    expect(GitCLIService.prototype.fetch).toBeCalledTimes(1);
    expect(GitCLIService.prototype.fetch).toBeCalledWith(cwd, "pull/2368/head:pr/2368");

    expect(GitCLIService.prototype.cherryPick).toBeCalledTimes(1);
    expect(GitCLIService.prototype.cherryPick).toBeCalledWith(cwd, "28f63db774185f4ec4b57cd9aaeb12dbfb4c9ecc");

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
      }
    );
  });
});