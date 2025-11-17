import { Args } from "@bp/service/args/args.types";
import { Configs } from "@bp/service/configs/configs.types";
import PullRequestConfigsParser from "@bp/service/configs/pullrequest/pr-configs-parser";
import GitClientFactory from "@bp/service/git/git-client-factory";
import { GitClientType } from "@bp/service/git/git.types";
import { mockGitHubClient } from "../../../support/mock/git-client-mock-support";
import { resetProcessArgs } from "../../../support/utils";
import { MERGED_PR_FIXTURE, REPO, TARGET_OWNER, MULT_COMMITS_PR_FIXTURE } from "../../../support/mock/github-data";
import GitHubMapper from "@bp/service/git/github/github-mapper";
import GitHubClient from "@bp/service/git/github/github-client";

jest.spyOn(GitHubMapper.prototype, "mapPullRequest");
jest.spyOn(GitHubClient.prototype, "getPullRequest");

describe("github pull request config parser", () => {

  const mergedPRUrl = `https://github.com/${TARGET_OWNER}/${REPO}/pull/${MERGED_PR_FIXTURE.number}`;
  const multipleCommitsPRUrl = `https://github.com/${TARGET_OWNER}/${REPO}/pull/${MULT_COMMITS_PR_FIXTURE.number}`;
  
  let configParser: PullRequestConfigsParser;

  beforeAll(() => {
    GitClientFactory.reset();
    GitClientFactory.getOrCreate(GitClientType.GITHUB, "whatever", "http://localhost/api/v3");
  });

  beforeEach(() => {
    // reset process.env variables
    resetProcessArgs();
    
    // mock octokit
    mockGitHubClient("http://localhost/api/v3");

    // create a fresh new instance every time
    configParser = new PullRequestConfigsParser();
  });

  test("multiple backports", async () => {
    const args: Args = {
      dryRun: false,
      auth: "",
      pullRequest: mergedPRUrl,
      targetBranch: "v1, v2, v3",
      gitUser: "Me",
      gitEmail: "me@email.com",
      title: "New Title",
      body: "New Body",
      bodyPrefix: "New Body Prefix -",
      reviewers: [],
      assignees: ["user3", "user4"],
      inheritReviewers: false,
      labels: [],
      inheritLabels: false,
      comments: [],
    };

    const configs: Configs = await configParser.parseAndValidate(args);

    expect(GitHubClient.prototype.getPullRequest).toHaveBeenCalledTimes(1);
    expect(GitHubClient.prototype.getPullRequest).toHaveBeenCalledWith("owner", "reponame", 2368, undefined);
    expect(GitHubMapper.prototype.mapPullRequest).toHaveBeenCalledTimes(1);
    expect(GitHubMapper.prototype.mapPullRequest).toHaveBeenCalledWith(expect.anything(), []);

    expect(configs.dryRun).toEqual(false);
    expect(configs.auth).toEqual("");
    expect(configs.folder).toEqual(process.cwd() + "/bp");
    expect(configs.backportPullRequests.length).toEqual(3);
    expect(configs.backportPullRequests).toEqual(
      expect.arrayContaining([
        {
          owner: "owner", 
          repo: "reponame", 
          head: "bp-v1-28f63db", 
          base: "v1", 
          title: "New Title",
          body: "New Body Prefix -New Body",
          reviewers: [],
          assignees: ["user3", "user4"],
          labels: [],
          comments: [],
        },
        {
          owner: "owner", 
          repo: "reponame", 
          head: "bp-v2-28f63db", 
          base: "v2", 
          title: "New Title",
          body: "New Body Prefix -New Body",
          reviewers: [],
          assignees: ["user3", "user4"],
          labels: [],
          comments: [],
        },
        {
          owner: "owner", 
          repo: "reponame", 
          head: "bp-v3-28f63db", 
          base: "v3", 
          title: "New Title",
          body: "New Body Prefix -New Body",
          reviewers: [],
          assignees: ["user3", "user4"],
          labels: [],
          comments: [],
        },
      ])
    );
  });

  test("multiple backports ignore duplicates", async () => {
    const args: Args = {
      dryRun: false,
      auth: "",
      pullRequest: mergedPRUrl,
      targetBranch: "v1, v2, v2, v3",
      gitUser: "Me",
      gitEmail: "me@email.com",
      title: "New Title",
      body: "New Body",
      bodyPrefix: "New Body Prefix -",
      reviewers: [],
      assignees: ["user3", "user4"],
      inheritReviewers: false,
      labels: [],
      inheritLabels: false,
      comments: [],
    };

    const configs: Configs = await configParser.parseAndValidate(args);

    expect(GitHubClient.prototype.getPullRequest).toHaveBeenCalledTimes(1);
    expect(GitHubClient.prototype.getPullRequest).toHaveBeenCalledWith("owner", "reponame", 2368, undefined);
    expect(GitHubMapper.prototype.mapPullRequest).toHaveBeenCalledTimes(1);
    expect(GitHubMapper.prototype.mapPullRequest).toHaveBeenCalledWith(expect.anything(), []);

    expect(configs.dryRun).toEqual(false);
    expect(configs.auth).toEqual("");
    expect(configs.folder).toEqual(process.cwd() + "/bp");
    expect(configs.backportPullRequests.length).toEqual(3);
    expect(configs.backportPullRequests).toEqual(
      expect.arrayContaining([
        {
          owner: "owner", 
          repo: "reponame", 
          head: "bp-v1-28f63db", 
          base: "v1", 
          title: "New Title",
          body: "New Body Prefix -New Body",
          reviewers: [],
          assignees: ["user3", "user4"],
          labels: [],
          comments: [],
        },
        {
          owner: "owner", 
          repo: "reponame", 
          head: "bp-v2-28f63db", 
          base: "v2", 
          title: "New Title",
          body: "New Body Prefix -New Body",
          reviewers: [],
          assignees: ["user3", "user4"],
          labels: [],
          comments: [],
        },
        {
          owner: "owner", 
          repo: "reponame", 
          head: "bp-v3-28f63db", 
          base: "v3", 
          title: "New Title",
          body: "New Body Prefix -New Body",
          reviewers: [],
          assignees: ["user3", "user4"],
          labels: [],
          comments: [],
        },
      ])
    );
  });

  test("multiple backports with custom branch name", async () => {
    const args: Args = {
      dryRun: false,
      auth: "",
      pullRequest: mergedPRUrl,
      targetBranch: "v1, v2, v3",
      gitUser: "Me",
      gitEmail: "me@email.com",
      title: "New Title",
      body: "New Body",
      bodyPrefix: "New Body Prefix -",
      reviewers: [],
      assignees: ["user3", "user4"],
      inheritReviewers: false,
      labels: [],
      inheritLabels: false,
      comments: [],
      bpBranchName: "custom-branch",
    };

    const configs: Configs = await configParser.parseAndValidate(args);

    expect(GitHubClient.prototype.getPullRequest).toHaveBeenCalledTimes(1);
    expect(GitHubClient.prototype.getPullRequest).toHaveBeenCalledWith("owner", "reponame", 2368, undefined);
    expect(GitHubMapper.prototype.mapPullRequest).toHaveBeenCalledTimes(1);
    expect(GitHubMapper.prototype.mapPullRequest).toHaveBeenCalledWith(expect.anything(), []);

    expect(configs.dryRun).toEqual(false);
    expect(configs.auth).toEqual("");
    expect(configs.folder).toEqual(process.cwd() + "/bp");
    expect(configs.backportPullRequests.length).toEqual(3);
    expect(configs.backportPullRequests).toEqual(
      expect.arrayContaining([
        {
          owner: "owner", 
          repo: "reponame", 
          head: "custom-branch-v1", 
          base: "v1", 
          title: "New Title",
          body: "New Body Prefix -New Body",
          reviewers: [],
          assignees: ["user3", "user4"],
          labels: [],
          comments: [],
        },
        {
          owner: "owner", 
          repo: "reponame", 
          head: "custom-branch-v2", 
          base: "v2", 
          title: "New Title",
          body: "New Body Prefix -New Body",
          reviewers: [],
          assignees: ["user3", "user4"],
          labels: [],
          comments: [],
        },
        {
          owner: "owner", 
          repo: "reponame", 
          head: "custom-branch-v3", 
          base: "v3", 
          title: "New Title",
          body: "New Body Prefix -New Body",
          reviewers: [],
          assignees: ["user3", "user4"],
          labels: [],
          comments: [],
        },
      ])
    );
  });

  test("multiple backports with multiple custom branch names", async () => {
    const args: Args = {
      dryRun: false,
      auth: "",
      pullRequest: mergedPRUrl,
      targetBranch: "v1, v2, v3",
      gitUser: "Me",
      gitEmail: "me@email.com",
      title: "New Title",
      body: "New Body",
      bodyPrefix: "New Body Prefix -",
      reviewers: [],
      assignees: ["user3", "user4"],
      inheritReviewers: false,
      labels: [],
      inheritLabels: false,
      comments: [],
      bpBranchName: "custom-branch1, custom-branch2, custom-branch3",
    };

    const configs: Configs = await configParser.parseAndValidate(args);

    expect(GitHubClient.prototype.getPullRequest).toHaveBeenCalledTimes(1);
    expect(GitHubClient.prototype.getPullRequest).toHaveBeenCalledWith("owner", "reponame", 2368, undefined);
    expect(GitHubMapper.prototype.mapPullRequest).toHaveBeenCalledTimes(1);
    expect(GitHubMapper.prototype.mapPullRequest).toHaveBeenCalledWith(expect.anything(), []);

    expect(configs.dryRun).toEqual(false);
    expect(configs.auth).toEqual("");
    expect(configs.folder).toEqual(process.cwd() + "/bp");
    expect(configs.backportPullRequests.length).toEqual(3);
    expect(configs.backportPullRequests).toEqual(
      expect.arrayContaining([
        {
          owner: "owner", 
          repo: "reponame", 
          head: "custom-branch1", 
          base: "v1", 
          title: "New Title",
          body: "New Body Prefix -New Body",
          reviewers: [],
          assignees: ["user3", "user4"],
          labels: [],
          comments: [],
        },
        {
          owner: "owner", 
          repo: "reponame", 
          head: "custom-branch2", 
          base: "v2", 
          title: "New Title",
          body: "New Body Prefix -New Body",
          reviewers: [],
          assignees: ["user3", "user4"],
          labels: [],
          comments: [],
        },
        {
          owner: "owner", 
          repo: "reponame", 
          head: "custom-branch3", 
          base: "v3", 
          title: "New Title",
          body: "New Body Prefix -New Body",
          reviewers: [],
          assignees: ["user3", "user4"],
          labels: [],
          comments: [],
        },
      ])
    );
  });

  test("multiple backports with incorrect number of bp branch names", async () => {
    const args: Args = {
      dryRun: false,
      auth: "",
      pullRequest: mergedPRUrl,
      targetBranch: "v1, v2, v3",
      gitUser: "Me",
      gitEmail: "me@email.com",
      title: "New Title",
      body: "New Body",
      bodyPrefix: "New Body Prefix -",
      reviewers: [],
      assignees: ["user3", "user4"],
      inheritReviewers: false,
      labels: [],
      inheritLabels: false,
      comments: [],
      bpBranchName: "custom-branch1, custom-branch2",
    };

    await expect(() => configParser.parseAndValidate(args)).rejects.toThrow("The number of backport branch names, if provided, must match the number of target branches or just one, provided 2 branch names instead");
  });

  test("multiple backports and multiple commits", async () => {
    const args: Args = {
      dryRun: false,
      auth: "",
      pullRequest: multipleCommitsPRUrl,
      targetBranch: "v4, v5, v6",
      gitUser: "GitHub",
      gitEmail: "noreply@github.com",
      reviewers: [],
      assignees: [],
      inheritReviewers: true,
      squash: false,
    };

    const configs: Configs = await configParser.parseAndValidate(args);

    expect(GitHubClient.prototype.getPullRequest).toHaveBeenCalledTimes(1);
    expect(GitHubClient.prototype.getPullRequest).toHaveBeenCalledWith("owner", "reponame", 8632, false);
    expect(GitHubMapper.prototype.mapPullRequest).toHaveBeenCalledTimes(1);
    expect(GitHubMapper.prototype.mapPullRequest).toHaveBeenCalledWith(expect.anything(), ["0404fb922ab75c3a8aecad5c97d9af388df04695", "11da4e38aa3e577ffde6d546f1c52e53b04d3151"]);

    expect(configs.dryRun).toEqual(false);
    expect(configs.git).toEqual({
      user: "GitHub",
      email: "noreply@github.com"
    });
    expect(configs.auth).toEqual("");
    expect(configs.folder).toEqual(process.cwd() + "/bp");
    expect(configs.backportPullRequests.length).toEqual(3);
    expect(configs.backportPullRequests).toEqual(
      expect.arrayContaining([
        {
          owner: "owner", 
          repo: "reponame", 
          head: "bp-v4-0404fb9-11da4e3", 
          base: "v4", 
          title: "[v4] PR Title",
          body: "**Backport:** https://github.com/owner/reponame/pull/8632\r\n\r\nPlease review and merge",
          reviewers: ["gh-user", "that-s-a-user"],
          assignees: [],
          labels: [],
          comments: [],
        },
        {
          owner: "owner", 
          repo: "reponame", 
          head: "bp-v5-0404fb9-11da4e3", 
          base: "v5", 
          title: "[v5] PR Title",
          body: "**Backport:** https://github.com/owner/reponame/pull/8632\r\n\r\nPlease review and merge",
          reviewers: ["gh-user", "that-s-a-user"],
          assignees: [],
          labels: [],
          comments: [],
        },
        {
          owner: "owner", 
          repo: "reponame", 
          head: "bp-v6-0404fb9-11da4e3", 
          base: "v6",
          title: "[v6] PR Title",
          body: "**Backport:** https://github.com/owner/reponame/pull/8632\r\n\r\nPlease review and merge",
          reviewers: ["gh-user", "that-s-a-user"],
          assignees: [],
          labels: [],
          comments: [],
        },
      ])
    );
  });

  test("multiple extracted branches and multiple commits", async () => {
    const args: Args = {
      dryRun: false,
      auth: "",
      pullRequest: multipleCommitsPRUrl,
      targetBranchPattern: "^backport (?<target>([^ ]+))$",
      gitUser: "GitHub",
      gitEmail: "noreply@github.com",
      reviewers: [],
      assignees: [],
      inheritReviewers: true,
      squash: false,
    };

    const configs: Configs = await configParser.parseAndValidate(args);

    expect(GitHubClient.prototype.getPullRequest).toHaveBeenCalledTimes(1);
    expect(GitHubClient.prototype.getPullRequest).toHaveBeenCalledWith("owner", "reponame", 8632, false);
    expect(GitHubMapper.prototype.mapPullRequest).toHaveBeenCalledTimes(1);
    expect(GitHubMapper.prototype.mapPullRequest).toHaveBeenCalledWith(expect.anything(), ["0404fb922ab75c3a8aecad5c97d9af388df04695", "11da4e38aa3e577ffde6d546f1c52e53b04d3151"]);

    expect(configs.dryRun).toEqual(false);
    expect(configs.git).toEqual({
      user: "GitHub",
      email: "noreply@github.com"
    });
    expect(configs.auth).toEqual("");
    expect(configs.folder).toEqual(process.cwd() + "/bp");
    expect(configs.backportPullRequests.length).toEqual(3);
    expect(configs.backportPullRequests).toEqual(
      expect.arrayContaining([
        {
          owner: "owner", 
          repo: "reponame", 
          head: "bp-v1-0404fb9-11da4e3", 
          base: "v1", 
          title: "[v1] PR Title",
          body: "**Backport:** https://github.com/owner/reponame/pull/8632\r\n\r\nPlease review and merge",
          reviewers: ["gh-user", "that-s-a-user"],
          assignees: [],
          labels: [],
          comments: [],
        },
        {
          owner: "owner", 
          repo: "reponame", 
          head: "bp-v2-0404fb9-11da4e3", 
          base: "v2", 
          title: "[v2] PR Title",
          body: "**Backport:** https://github.com/owner/reponame/pull/8632\r\n\r\nPlease review and merge",
          reviewers: ["gh-user", "that-s-a-user"],
          assignees: [],
          labels: [],
          comments: [],
        },
        {
          owner: "owner", 
          repo: "reponame", 
          head: "bp-v3-0404fb9-11da4e3", 
          base: "v3",
          title: "[v3] PR Title",
          body: "**Backport:** https://github.com/owner/reponame/pull/8632\r\n\r\nPlease review and merge",
          reviewers: ["gh-user", "that-s-a-user"],
          assignees: [],
          labels: [],
          comments: [],
        },
      ])
    );
  });
  
});