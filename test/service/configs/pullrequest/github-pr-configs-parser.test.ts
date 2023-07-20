import { Args } from "@bp/service/args/args.types";
import { Configs } from "@bp/service/configs/configs.types";
import PullRequestConfigsParser from "@bp/service/configs/pullrequest/pr-configs-parser";
import GitClientFactory from "@bp/service/git/git-client-factory";
import { GitClientType } from "@bp/service/git/git.types";
import { mockGitHubClient } from "../../../support/mock/git-client-mock-support";
import { addProcessArgs, createTestFile, removeTestFile, resetProcessArgs } from "../../../support/utils";
import { mergedPullRequestFixture, openPullRequestFixture, notMergedPullRequestFixture, repo, targetOwner, multipleCommitsPullRequestFixture } from "../../../support/mock/github-data";
import CLIArgsParser from "@bp/service/args/cli/cli-args-parser";
import GitHubMapper from "@bp/service/git/github/github-mapper";
import GitHubClient from "@bp/service/git/github/github-client";

const GITHUB_MERGED_PR_SIMPLE_CONFIG_FILE_CONTENT_PATHNAME = "./github-pr-configs-parser-simple-pr-merged.json";
const GITHUB_MERGED_PR_SIMPLE_CONFIG_FILE_CONTENT = {
  "targetBranch": "prod",
  "pullRequest": `https://github.com/${targetOwner}/${repo}/pull/${mergedPullRequestFixture.number}`,
};

const GITHUB_MERGED_PR_COMPLEX_CONFIG_FILE_CONTENT_PATHNAME = "./github-pr-configs-parser-complex-pr-merged.json";
const GITHUB_MERGED_PR_COMPLEX_CONFIG_FILE_CONTENT = {
  "dryRun": false,
  "auth": "my-auth-token",
  "pullRequest": `https://github.com/${targetOwner}/${repo}/pull/${mergedPullRequestFixture.number}`,
  "targetBranch": "prod",
  "gitUser": "Me",
  "gitEmail": "me@email.com",
  "title": "New Title",
  "body": "New Body",
  "bodyPrefix": "New Body Prefix -",
  "reviewers": ["user1", "user2"],
  "assignees": ["user3", "user4"],
  "inheritReviewers": true, // not taken into account
  "labels": ["cherry-pick :cherries:"],
  "inheritLabels": true,
};

jest.spyOn(GitHubMapper.prototype, "mapPullRequest");
jest.spyOn(GitHubClient.prototype, "getPullRequest");

describe("github pull request config parser", () => {

  const mergedPRUrl = `https://github.com/${targetOwner}/${repo}/pull/${mergedPullRequestFixture.number}`;
  const openPRUrl = `https://github.com/${targetOwner}/${repo}/pull/${openPullRequestFixture.number}`;
  const notMergedPRUrl = `https://github.com/${targetOwner}/${repo}/pull/${notMergedPullRequestFixture.number}`;
  const multipleCommitsPRUrl = `https://github.com/${targetOwner}/${repo}/pull/${multipleCommitsPullRequestFixture.number}`;
  
  let argsParser: CLIArgsParser;
  let configParser: PullRequestConfigsParser;

  beforeAll(() => {
    // create a temporary file
    createTestFile(GITHUB_MERGED_PR_SIMPLE_CONFIG_FILE_CONTENT_PATHNAME, JSON.stringify(GITHUB_MERGED_PR_SIMPLE_CONFIG_FILE_CONTENT));
    createTestFile(GITHUB_MERGED_PR_COMPLEX_CONFIG_FILE_CONTENT_PATHNAME, JSON.stringify(GITHUB_MERGED_PR_COMPLEX_CONFIG_FILE_CONTENT));

    GitClientFactory.reset();
    GitClientFactory.getOrCreate(GitClientType.GITHUB, "whatever", "http://localhost/api/v3");
  });

  afterAll(() => {
    // clean up all temporary files
    removeTestFile(GITHUB_MERGED_PR_SIMPLE_CONFIG_FILE_CONTENT_PATHNAME);
    removeTestFile(GITHUB_MERGED_PR_COMPLEX_CONFIG_FILE_CONTENT_PATHNAME);
  });

  beforeEach(() => {
    // reset process.env variables
    resetProcessArgs();

    // mock octokit
    mockGitHubClient("http://localhost/api/v3");

    // create a fresh new instance every time
    argsParser = new CLIArgsParser();
    configParser = new PullRequestConfigsParser();
  });

  test("parse configs from pull request", async () => {
    const args: Args = {
      dryRun: false,
      auth: "",
      pullRequest: mergedPRUrl,
      targetBranch: "prod",
      gitUser: "GitHub",
      gitEmail: "noreply@github.com",
      reviewers: [],
      assignees: [],
      inheritReviewers: true,
    };

    const configs: Configs = await configParser.parseAndValidate(args);

    expect(GitHubClient.prototype.getPullRequest).toBeCalledTimes(1);
    expect(GitHubClient.prototype.getPullRequest).toBeCalledWith("owner", "reponame", 2368, true);
    expect(GitHubMapper.prototype.mapPullRequest).toBeCalledTimes(1);
    expect(GitHubMapper.prototype.mapPullRequest).toBeCalledWith(expect.anything(), []);

    expect(configs.dryRun).toEqual(false);
    expect(configs.git).toEqual({
      user: "GitHub",
      email: "noreply@github.com"
    });
    expect(configs.auth).toEqual("");
    expect(configs.targetBranch).toEqual("prod");
    expect(configs.folder).toEqual(process.cwd() + "/bp");
    expect(configs.originalPullRequest).toEqual({
      number: 2368,
      author: "gh-user",
      url: "https://api.github.com/repos/owner/reponame/pulls/2368",
      htmlUrl: "https://github.com/owner/reponame/pull/2368",
      state: "closed",
      merged: true,
      mergedBy: "that-s-a-user",
      title: "PR Title",
      body: "Please review and merge",
      reviewers: ["requested-gh-user", "gh-user"],
      assignees: [],
      labels: ["original-label"],
      targetRepo: {
        owner: "owner",
        project: "reponame",
        cloneUrl: "https://github.com/owner/reponame.git"
      },
      sourceRepo: {
        owner: "fork",
        project: "reponame",
        cloneUrl: "https://github.com/fork/reponame.git"
      },
      nCommits: 2,
      commits: ["28f63db774185f4ec4b57cd9aaeb12dbfb4c9ecc"]
    });
    expect(configs.backportPullRequest).toEqual({
      author: "GitHub",
      url: undefined,
      htmlUrl: undefined,
      title: "[prod] PR Title",
      body: "**Backport:** https://github.com/owner/reponame/pull/2368\r\n\r\nPlease review and merge",
      reviewers: ["gh-user", "that-s-a-user"],
      assignees: [],
      labels: [],
      targetRepo: {
        owner: "owner",
        project: "reponame",
        cloneUrl: "https://github.com/owner/reponame.git"
      },
      sourceRepo: {
        owner: "owner",
        project: "reponame",
        cloneUrl: "https://github.com/owner/reponame.git"
      },
      bpBranchName: undefined,
    });
  });

  test("override folder", async () => {
    const args: Args = {
      dryRun: true,
      auth: "whatever",
      pullRequest: mergedPRUrl,
      targetBranch: "prod",
      folder: "/tmp/test",
      gitUser: "GitHub",
      gitEmail: "noreply@github.com",
      reviewers: [],
      assignees: [],
      inheritReviewers: true,
    };

    const configs: Configs = await configParser.parseAndValidate(args);

    expect(configs.dryRun).toEqual(true);
    expect(configs.auth).toEqual("whatever");
    expect(configs.targetBranch).toEqual("prod");
    expect(configs.folder).toEqual("/tmp/test");
    expect(configs.git).toEqual({
      user: "GitHub",
      email: "noreply@github.com"
    });
  });

  test("still open pull request", async () => {
    const args: Args = {
      dryRun: true,
      auth: "whatever",
      pullRequest: openPRUrl,
      targetBranch: "prod",
      gitUser: "GitHub",
      gitEmail: "noreply@github.com",
      reviewers: [],
      assignees: [],
      inheritReviewers: true,
    };

    const configs: Configs = await configParser.parseAndValidate(args);

    expect(GitHubClient.prototype.getPullRequest).toBeCalledTimes(1);
    expect(GitHubClient.prototype.getPullRequest).toBeCalledWith("owner", "reponame", 4444, true);
    expect(GitHubMapper.prototype.mapPullRequest).toBeCalledTimes(1);
    expect(GitHubMapper.prototype.mapPullRequest).toBeCalledWith(expect.anything(), []);

    expect(configs.dryRun).toEqual(true);
    expect(configs.auth).toEqual("whatever");
    expect(configs.targetBranch).toEqual("prod");
    expect(configs.git).toEqual({
      user: "GitHub",
      email: "noreply@github.com"
    });
    expect(configs.originalPullRequest).toEqual({
      number: 4444,
      author: "gh-user",
      url: "https://api.github.com/repos/owner/reponame/pulls/4444",
      htmlUrl: "https://github.com/owner/reponame/pull/4444",
      state: "open",
      merged: false,
      mergedBy: undefined,
      title: "PR Title",
      body: "Please review and merge",
      reviewers: ["gh-user"],
      assignees: [],
      labels: [],
      targetRepo: {
        owner: "owner",
        project: "reponame",
        cloneUrl: "https://github.com/owner/reponame.git"
      },
      sourceRepo: {
        owner: "fork",
        project: "reponame",
        cloneUrl: "https://github.com/fork/reponame.git"
      },
      bpBranchName: undefined,
      nCommits: 2,
      // taken from head.sha
      commits: ["91748965051fae1330ad58d15cf694e103267c87"]
    });
  });

  test("closed pull request", async () => {
    const args: Args = {
      dryRun: true,
      auth: "whatever",
      pullRequest: notMergedPRUrl,
      targetBranch: "prod",
      gitUser: "GitHub",
      gitEmail: "noreply@github.com",
      reviewers: [],
      assignees: [],
      inheritReviewers: true,
    };

    await expect(() => configParser.parseAndValidate(args)).rejects.toThrow("Provided pull request is closed and not merged");
  });

  test("override backport pr data inheriting reviewers", async () => {
    const args: Args = {
      dryRun: false,
      auth: "",
      pullRequest: mergedPRUrl,
      targetBranch: "prod",
      gitUser: "Me",
      gitEmail: "me@email.com",
      title: "New Title",
      body: "New Body",
      bodyPrefix: "New Body Prefix -",
      reviewers: [],
      assignees: [],
      inheritReviewers: true,
    };

    const configs: Configs = await configParser.parseAndValidate(args);

    expect(GitHubClient.prototype.getPullRequest).toBeCalledTimes(1);
    expect(GitHubClient.prototype.getPullRequest).toBeCalledWith("owner", "reponame", 2368, true);
    expect(GitHubMapper.prototype.mapPullRequest).toBeCalledTimes(1);
    expect(GitHubMapper.prototype.mapPullRequest).toBeCalledWith(expect.anything(), []);

    expect(configs.dryRun).toEqual(false);
    expect(configs.git).toEqual({
      user: "Me",
      email: "me@email.com"
    });
    expect(configs.auth).toEqual("");
    expect(configs.targetBranch).toEqual("prod");
    expect(configs.folder).toEqual(process.cwd() + "/bp");
    expect(configs.originalPullRequest).toEqual({
      number: 2368,
      author: "gh-user",
      url: "https://api.github.com/repos/owner/reponame/pulls/2368",
      htmlUrl: "https://github.com/owner/reponame/pull/2368",
      state: "closed",
      merged: true,
      mergedBy: "that-s-a-user",
      title: "PR Title",
      body: "Please review and merge",
      reviewers: ["requested-gh-user", "gh-user"],
      assignees: [],
      labels: ["original-label"],
      targetRepo: {
        owner: "owner",
        project: "reponame",
        cloneUrl: "https://github.com/owner/reponame.git"
      },
      sourceRepo: {
        owner: "fork",
        project: "reponame",
        cloneUrl: "https://github.com/fork/reponame.git"
      },
      bpBranchName: undefined,
      nCommits: 2,
      commits: ["28f63db774185f4ec4b57cd9aaeb12dbfb4c9ecc"],
    });
    expect(configs.backportPullRequest).toEqual({
      author: "Me",
      url: undefined,
      htmlUrl: undefined,
      title: "New Title",
      body: "New Body Prefix -New Body",
      reviewers: ["gh-user", "that-s-a-user"],
      assignees: [],
      labels: [],
      targetRepo: {
        owner: "owner",
        project: "reponame",
        cloneUrl: "https://github.com/owner/reponame.git"
      },
      sourceRepo: {
        owner: "owner",
        project: "reponame",
        cloneUrl: "https://github.com/owner/reponame.git"
      },
      bpBranchName: undefined,
    });
  });

  test("override backport pr reviewers and assignees", async () => {
    const args: Args = {
      dryRun: false,
      auth: "",
      pullRequest: mergedPRUrl,
      targetBranch: "prod",
      gitUser: "Me",
      gitEmail: "me@email.com",
      title: "New Title",
      body: "New Body",
      bodyPrefix: "New Body Prefix -",
      reviewers: ["user1", "user2"],
      assignees: ["user3", "user4"],
      inheritReviewers: true, // not taken into account
    };

    const configs: Configs = await configParser.parseAndValidate(args);

    expect(GitHubClient.prototype.getPullRequest).toBeCalledTimes(1);
    expect(GitHubClient.prototype.getPullRequest).toBeCalledWith("owner", "reponame", 2368, true);
    expect(GitHubMapper.prototype.mapPullRequest).toBeCalledTimes(1);
    expect(GitHubMapper.prototype.mapPullRequest).toBeCalledWith(expect.anything(), []);

    expect(configs.dryRun).toEqual(false);
    expect(configs.git).toEqual({
      user: "Me",
      email: "me@email.com"
    });
    expect(configs.auth).toEqual("");
    expect(configs.targetBranch).toEqual("prod");
    expect(configs.folder).toEqual(process.cwd() + "/bp");
    expect(configs.originalPullRequest).toEqual({
      number: 2368,
      author: "gh-user",
      url: "https://api.github.com/repos/owner/reponame/pulls/2368",
      htmlUrl: "https://github.com/owner/reponame/pull/2368",
      state: "closed",
      merged: true,
      mergedBy: "that-s-a-user",
      title: "PR Title",
      body: "Please review and merge",
      reviewers: ["requested-gh-user", "gh-user"],
      assignees: [],
      labels: ["original-label"],
      targetRepo: {
        owner: "owner",
        project: "reponame",
        cloneUrl: "https://github.com/owner/reponame.git"
      },
      sourceRepo: {
        owner: "fork",
        project: "reponame",
        cloneUrl: "https://github.com/fork/reponame.git"
      },
      bpBranchName: undefined,
      nCommits: 2,
      commits: ["28f63db774185f4ec4b57cd9aaeb12dbfb4c9ecc"],
    });
    expect(configs.backportPullRequest).toEqual({
      author: "Me",
      url: undefined,
      htmlUrl: undefined,
      title: "New Title",
      body: "New Body Prefix -New Body",
      reviewers: ["user1", "user2"],
      assignees: ["user3", "user4"],
      labels: [],
      targetRepo: {
        owner: "owner",
        project: "reponame",
        cloneUrl: "https://github.com/owner/reponame.git"
      },
      sourceRepo: {
        owner: "owner",
        project: "reponame",
        cloneUrl: "https://github.com/owner/reponame.git"
      },
      bpBranchName: undefined,
    });
  });

  test("override backport pr empty reviewers", async () => {
    const args: Args = {
      dryRun: false,
      auth: "",
      pullRequest: mergedPRUrl,
      targetBranch: "prod",
      gitUser: "Me",
      gitEmail: "me@email.com",
      title: "New Title",
      body: "New Body",
      bodyPrefix: "New Body Prefix -",
      reviewers: [],
      assignees: ["user3", "user4"],
      inheritReviewers: false,
    };

    const configs: Configs = await configParser.parseAndValidate(args);

    expect(GitHubClient.prototype.getPullRequest).toBeCalledTimes(1);
    expect(GitHubClient.prototype.getPullRequest).toBeCalledWith("owner", "reponame", 2368, true);
    expect(GitHubMapper.prototype.mapPullRequest).toBeCalledTimes(1);
    expect(GitHubMapper.prototype.mapPullRequest).toBeCalledWith(expect.anything(), []);

    expect(configs.dryRun).toEqual(false);
    expect(configs.git).toEqual({
      user: "Me",
      email: "me@email.com"
    });
    expect(configs.auth).toEqual("");
    expect(configs.targetBranch).toEqual("prod");
    expect(configs.folder).toEqual(process.cwd() + "/bp");
    expect(configs.originalPullRequest).toEqual({
      number: 2368,
      author: "gh-user",
      url: "https://api.github.com/repos/owner/reponame/pulls/2368",
      htmlUrl: "https://github.com/owner/reponame/pull/2368",
      state: "closed",
      merged: true,
      mergedBy: "that-s-a-user",
      title: "PR Title",
      body: "Please review and merge",
      reviewers: ["requested-gh-user", "gh-user"],
      assignees: [],
      labels: ["original-label"],
      targetRepo: {
        owner: "owner",
        project: "reponame",
        cloneUrl: "https://github.com/owner/reponame.git"
      },
      sourceRepo: {
        owner: "fork",
        project: "reponame",
        cloneUrl: "https://github.com/fork/reponame.git"
      },
      bpBranchName: undefined,
      nCommits: 2,
      commits: ["28f63db774185f4ec4b57cd9aaeb12dbfb4c9ecc"],
    });
    expect(configs.backportPullRequest).toEqual({
      author: "Me",
      url: undefined,
      htmlUrl: undefined,
      title: "New Title",
      body: "New Body Prefix -New Body",
      reviewers: [],
      assignees: ["user3", "user4"],
      labels: [],
      targetRepo: {
        owner: "owner",
        project: "reponame",
        cloneUrl: "https://github.com/owner/reponame.git"
      },
      sourceRepo: {
        owner: "owner",
        project: "reponame",
        cloneUrl: "https://github.com/owner/reponame.git"
      },
      bpBranchName: undefined,
    });
  });

  test("override backport pr custom labels with duplicates", async () => {
    const args: Args = {
      dryRun: false,
      auth: "",
      pullRequest: mergedPRUrl,
      targetBranch: "prod",
      gitUser: "Me",
      gitEmail: "me@email.com",
      title: "New Title",
      body: "New Body",
      bodyPrefix: "New Body Prefix -",
      reviewers: [],
      assignees: ["user3", "user4"],
      inheritReviewers: false,
      labels: ["custom-label", "original-label"], // also include the one inherited
      inheritLabels: true,
    };

    const configs: Configs = await configParser.parseAndValidate(args);

    expect(GitHubClient.prototype.getPullRequest).toBeCalledTimes(1);
    expect(GitHubClient.prototype.getPullRequest).toBeCalledWith("owner", "reponame", 2368, true);
    expect(GitHubMapper.prototype.mapPullRequest).toBeCalledTimes(1);
    expect(GitHubMapper.prototype.mapPullRequest).toBeCalledWith(expect.anything(), []);

    expect(configs.dryRun).toEqual(false);
    expect(configs.git).toEqual({
      user: "Me",
      email: "me@email.com"
    });
    expect(configs.auth).toEqual("");
    expect(configs.targetBranch).toEqual("prod");
    expect(configs.folder).toEqual(process.cwd() + "/bp");
    expect(configs.originalPullRequest).toEqual({
      number: 2368,
      author: "gh-user",
      url: "https://api.github.com/repos/owner/reponame/pulls/2368",
      htmlUrl: "https://github.com/owner/reponame/pull/2368",
      state: "closed",
      merged: true,
      mergedBy: "that-s-a-user",
      title: "PR Title",
      body: "Please review and merge",
      reviewers: ["requested-gh-user", "gh-user"],
      assignees: [],
      labels: ["original-label"],
      targetRepo: {
        owner: "owner",
        project: "reponame",
        cloneUrl: "https://github.com/owner/reponame.git"
      },
      sourceRepo: {
        owner: "fork",
        project: "reponame",
        cloneUrl: "https://github.com/fork/reponame.git"
      },
      bpBranchName: undefined,
      nCommits: 2,
      commits: ["28f63db774185f4ec4b57cd9aaeb12dbfb4c9ecc"],
    });
    expect(configs.backportPullRequest).toEqual({
      author: "Me",
      url: undefined,
      htmlUrl: undefined,
      title: "New Title",
      body: "New Body Prefix -New Body",
      reviewers: [],
      assignees: ["user3", "user4"],
      labels: ["custom-label", "original-label"],
      targetRepo: {
        owner: "owner",
        project: "reponame",
        cloneUrl: "https://github.com/owner/reponame.git"
      },
      sourceRepo: {
        owner: "owner",
        project: "reponame",
        cloneUrl: "https://github.com/owner/reponame.git"
      },
      bpBranchName: undefined,
    });
  });
  
  test("using simple config file", async () => {
    addProcessArgs([
      "-cf",
      GITHUB_MERGED_PR_SIMPLE_CONFIG_FILE_CONTENT_PATHNAME,
    ]);

    const args: Args = argsParser.parse();
    const configs: Configs = await configParser.parseAndValidate(args);

    expect(GitHubClient.prototype.getPullRequest).toBeCalledTimes(1);
    expect(GitHubClient.prototype.getPullRequest).toBeCalledWith("owner", "reponame", 2368, true);
    expect(GitHubMapper.prototype.mapPullRequest).toBeCalledTimes(1);
    expect(GitHubMapper.prototype.mapPullRequest).toBeCalledWith(expect.anything(), []);

    expect(configs.dryRun).toEqual(false);
    expect(configs.git).toEqual({
      user: "GitHub",
      email: "noreply@github.com"
    });
    expect(configs.auth).toEqual(undefined);
    expect(configs.targetBranch).toEqual("prod");
    expect(configs.folder).toEqual(process.cwd() + "/bp");
    expect(configs.originalPullRequest).toEqual({
      number: 2368,
      author: "gh-user",
      url: "https://api.github.com/repos/owner/reponame/pulls/2368",
      htmlUrl: "https://github.com/owner/reponame/pull/2368",
      state: "closed",
      merged: true,
      mergedBy: "that-s-a-user",
      title: "PR Title",
      body: "Please review and merge",
      reviewers: ["requested-gh-user", "gh-user"],
      assignees: [],
      labels: ["original-label"],
      targetRepo: {
        owner: "owner",
        project: "reponame",
        cloneUrl: "https://github.com/owner/reponame.git"
      },
      sourceRepo: {
        owner: "fork",
        project: "reponame",
        cloneUrl: "https://github.com/fork/reponame.git"
      },
      nCommits: 2,
      commits: ["28f63db774185f4ec4b57cd9aaeb12dbfb4c9ecc"]
    });
    expect(configs.backportPullRequest).toEqual({
      author: "GitHub",
      url: undefined,
      htmlUrl: undefined,
      title: "[prod] PR Title",
      body: "**Backport:** https://github.com/owner/reponame/pull/2368\r\n\r\nPlease review and merge",
      reviewers: ["gh-user", "that-s-a-user"],
      assignees: [],
      labels: [],
      targetRepo: {
        owner: "owner",
        project: "reponame",
        cloneUrl: "https://github.com/owner/reponame.git"
      },
      sourceRepo: {
        owner: "owner",
        project: "reponame",
        cloneUrl: "https://github.com/owner/reponame.git"
      },
      bpBranchName: undefined,
    });
  });

  test("using complex config file", async () => {
    addProcessArgs([
      "-cf",
      GITHUB_MERGED_PR_COMPLEX_CONFIG_FILE_CONTENT_PATHNAME,
    ]);

    const args: Args = argsParser.parse();
    const configs: Configs = await configParser.parseAndValidate(args);

    expect(GitHubClient.prototype.getPullRequest).toBeCalledTimes(1);
    expect(GitHubClient.prototype.getPullRequest).toBeCalledWith("owner", "reponame", 2368, true);
    expect(GitHubMapper.prototype.mapPullRequest).toBeCalledTimes(1);
    expect(GitHubMapper.prototype.mapPullRequest).toBeCalledWith(expect.anything(), []);

    expect(configs.dryRun).toEqual(false);
    expect(configs.git).toEqual({
      user: "Me",
      email: "me@email.com"
    });
    expect(configs.auth).toEqual("my-auth-token");
    expect(configs.targetBranch).toEqual("prod");
    expect(configs.folder).toEqual(process.cwd() + "/bp");
    expect(configs.originalPullRequest).toEqual({
      number: 2368,
      author: "gh-user",
      url: "https://api.github.com/repos/owner/reponame/pulls/2368",
      htmlUrl: "https://github.com/owner/reponame/pull/2368",
      state: "closed",
      merged: true,
      mergedBy: "that-s-a-user",
      title: "PR Title",
      body: "Please review and merge",
      reviewers: ["requested-gh-user", "gh-user"],
      assignees: [],
      labels: ["original-label"],
      targetRepo: {
        owner: "owner",
        project: "reponame",
        cloneUrl: "https://github.com/owner/reponame.git"
      },
      sourceRepo: {
        owner: "fork",
        project: "reponame",
        cloneUrl: "https://github.com/fork/reponame.git"
      },
      bpBranchName: undefined,
      nCommits: 2,
      commits: ["28f63db774185f4ec4b57cd9aaeb12dbfb4c9ecc"],
    });
    expect(configs.backportPullRequest).toEqual({
      author: "Me",
      url: undefined,
      htmlUrl: undefined,
      title: "New Title",
      body: "New Body Prefix -New Body",
      reviewers: ["user1", "user2"],
      assignees: ["user3", "user4"],
      labels: ["cherry-pick :cherries:", "original-label"],
      targetRepo: {
        owner: "owner",
        project: "reponame",
        cloneUrl: "https://github.com/owner/reponame.git"
      },
      sourceRepo: {
        owner: "owner",
        project: "reponame",
        cloneUrl: "https://github.com/owner/reponame.git"
      },
      bpBranchName: undefined,
    });
  });

  test("parse configs from pull request without squashing with multiple commits", async () => {
    const args: Args = {
      dryRun: false,
      auth: "",
      pullRequest: multipleCommitsPRUrl,
      targetBranch: "prod",
      gitUser: "GitHub",
      gitEmail: "noreply@github.com",
      reviewers: [],
      assignees: [],
      inheritReviewers: true,
      squash: false,
    };

    const configs: Configs = await configParser.parseAndValidate(args);

    expect(GitHubClient.prototype.getPullRequest).toBeCalledTimes(1);
    expect(GitHubClient.prototype.getPullRequest).toBeCalledWith("owner", "reponame", 8632, false);
    expect(GitHubMapper.prototype.mapPullRequest).toBeCalledTimes(1);
    expect(GitHubMapper.prototype.mapPullRequest).toBeCalledWith(expect.anything(), ["0404fb922ab75c3a8aecad5c97d9af388df04695", "11da4e38aa3e577ffde6d546f1c52e53b04d3151"]);

    expect(configs.dryRun).toEqual(false);
    expect(configs.git).toEqual({
      user: "GitHub",
      email: "noreply@github.com"
    });
    expect(configs.auth).toEqual("");
    expect(configs.targetBranch).toEqual("prod");
    expect(configs.folder).toEqual(process.cwd() + "/bp");
    expect(configs.originalPullRequest).toEqual({
      number: 8632,
      author: "gh-user",
      url: "https://api.github.com/repos/owner/reponame/pulls/8632",
      htmlUrl: "https://github.com/owner/reponame/pull/8632",
      state: "closed",
      merged: true,
      mergedBy: "that-s-a-user",
      title: "PR Title",
      body: "Please review and merge",
      reviewers: ["requested-gh-user", "gh-user"],
      assignees: [],
      labels: [],
      targetRepo: {
        owner: "owner",
        project: "reponame",
        cloneUrl: "https://github.com/owner/reponame.git"
      },
      sourceRepo: {
        owner: "owner",
        project: "reponame",
        cloneUrl: "https://github.com/owner/reponame.git"
      },
      nCommits: 2,
      commits: ["0404fb922ab75c3a8aecad5c97d9af388df04695", "11da4e38aa3e577ffde6d546f1c52e53b04d3151"]
    });
    expect(configs.backportPullRequest).toEqual({
      author: "GitHub",
      url: undefined,
      htmlUrl: undefined,
      title: "[prod] PR Title",
      body: "**Backport:** https://github.com/owner/reponame/pull/8632\r\n\r\nPlease review and merge",
      reviewers: ["gh-user", "that-s-a-user"],
      assignees: [],
      labels: [],
      targetRepo: {
        owner: "owner",
        project: "reponame",
        cloneUrl: "https://github.com/owner/reponame.git"
      },
      sourceRepo: {
        owner: "owner",
        project: "reponame",
        cloneUrl: "https://github.com/owner/reponame.git"
      },
      bpBranchName: undefined,
    });
  });
});