import { Args } from "@bp/service/args/args.types";
import { Configs } from "@bp/service/configs/configs.types";
import PullRequestConfigsParser from "@bp/service/configs/pullrequest/pr-configs-parser";
import GitClientFactory from "@bp/service/git/git-client-factory";
import { GitClientType } from "@bp/service/git/git.types";
import { getAxiosMocked } from "../../../support/mock/git-client-mock-support";
import { CLOSED_NOT_MERGED_MR, MERGED_SQUASHED_MR, OPEN_MR } from "../../../support/mock/gitlab-data";
import GHAArgsParser from "@bp/service/args/gha/gha-args-parser";
import { createTestFile, removeTestFile, resetEnvTokens, spyGetInput } from "../../../support/utils";
import GitLabClient from "@bp/service/git/gitlab/gitlab-client";
import GitLabMapper from "@bp/service/git/gitlab/gitlab-mapper";

const GITLAB_MERGED_PR_SIMPLE_CONFIG_FILE_CONTENT_PATHNAME = "./gitlab-pr-configs-parser-simple-pr-merged.json";
const GITLAB_MERGED_PR_SIMPLE_CONFIG_FILE_CONTENT = {
  "targetBranch": "prod",
  "pullRequest": `https://my.gitlab.host.com/superuser/backporting-example/-/merge_requests/${MERGED_SQUASHED_MR.iid}`,
};

const GITLAB_MERGED_PR_COMPLEX_CONFIG_FILE_CONTENT_PATHNAME = "./gitlab-pr-configs-parser-complex-pr-merged.json";
const GITLAB_MERGED_PR_COMPLEX_CONFIG_FILE_CONTENT = {
  "dryRun": false,
  "auth": "my-token",
  "pullRequest": `https://my.gitlab.host.com/superuser/backporting-example/-/merge_requests/${MERGED_SQUASHED_MR.iid}`,
  "targetBranch": "prod",
  "gitUser": "Me",
  "gitEmail": "me@email.com",
  "title": "New Title",
  "body": "New Body",
  "bodyPrefix": "New Body Prefix -",
  "reviewers": [],
  "assignees": ["user3", "user4"],
  "inheritReviewers": false,
  "labels": ["cherry-pick :cherries:"],
  "inheritLabels": true,
};

jest.spyOn(GitLabMapper.prototype, "mapPullRequest");
jest.spyOn(GitLabClient.prototype, "getPullRequest");

jest.mock("axios", () => {
  return {
    create: jest.fn(() => ({
      get: getAxiosMocked,
    })),
  };
});

describe("gitlab merge request config parser", () => {

  const mergedPRUrl = `https://my.gitlab.host.com/superuser/backporting-example/-/merge_requests/${MERGED_SQUASHED_MR.iid}`;
  const openPRUrl = `https://my.gitlab.host.com/superuser/backporting-example/-/merge_requests/${OPEN_MR.iid}`;
  const notMergedPRUrl = `https://my.gitlab.host.com/superuser/backporting-example/-/merge_requests/${CLOSED_NOT_MERGED_MR.iid}`;
  
  let argsParser: GHAArgsParser;
  let configParser: PullRequestConfigsParser;

  beforeAll(() => {
    // create a temporary file
    createTestFile(GITLAB_MERGED_PR_SIMPLE_CONFIG_FILE_CONTENT_PATHNAME, JSON.stringify(GITLAB_MERGED_PR_SIMPLE_CONFIG_FILE_CONTENT));
    createTestFile(GITLAB_MERGED_PR_COMPLEX_CONFIG_FILE_CONTENT_PATHNAME, JSON.stringify(GITLAB_MERGED_PR_COMPLEX_CONFIG_FILE_CONTENT));

    GitClientFactory.reset();
    GitClientFactory.getOrCreate(GitClientType.GITLAB, "whatever", "my.gitlab.host.com");
  });
  
  afterAll(() => {
    // clean up all temporary files
    removeTestFile(GITLAB_MERGED_PR_SIMPLE_CONFIG_FILE_CONTENT_PATHNAME);
    removeTestFile(GITLAB_MERGED_PR_COMPLEX_CONFIG_FILE_CONTENT_PATHNAME);
  });

  beforeEach(() => {
    // reset env tokens
    resetEnvTokens();
    
    argsParser = new GHAArgsParser();
    configParser = new PullRequestConfigsParser();
  });

  test("parse configs from merge request", async () => {
    const args: Args = {
      dryRun: false,
      auth: undefined,
      pullRequest: mergedPRUrl,
      targetBranch: "prod",
      gitUser: "Gitlab",
      gitEmail: "noreply@gitlab.com",
      reviewers: [],
      assignees: [],
      inheritReviewers: true,
    };

    const configs: Configs = await configParser.parseAndValidate(args);

    expect(GitLabClient.prototype.getPullRequest).toBeCalledTimes(1);
    expect(GitLabClient.prototype.getPullRequest).toBeCalledWith("superuser", "backporting-example", 1, true);
    expect(GitLabMapper.prototype.mapPullRequest).toBeCalledTimes(1);
    expect(GitLabMapper.prototype.mapPullRequest).toBeCalledWith(expect.anything(), []);

    expect(configs.dryRun).toEqual(false);
    expect(configs.git).toEqual({
      user: "Gitlab",
      email: "noreply@gitlab.com"
    });
    expect(configs.auth).toEqual(undefined);
    expect(configs.folder).toEqual(process.cwd() + "/bp");
    expect(configs.originalPullRequest).toEqual({
      number: 1,
      author: "superuser",
      url: "https://my.gitlab.host.com/superuser/backporting-example/-/merge_requests/1",
      htmlUrl: "https://my.gitlab.host.com/superuser/backporting-example/-/merge_requests/1",
      state: "merged",
      merged: true,
      mergedBy: "superuser",
      title: "Update test.txt",
      body: "This is the body",
      reviewers: ["superuser1", "superuser2"],
      assignees: ["superuser"],
      labels: ["gitlab-original-label"],
      targetRepo: {
        owner: "superuser",
        project: "backporting-example",
        cloneUrl: "https://my.gitlab.host.com/superuser/backporting-example.git"
      },
      sourceRepo: {
        owner: "superuser",
        project: "backporting-example",
        cloneUrl: "https://my.gitlab.host.com/superuser/backporting-example.git"
      },
      nCommits: 1,
      commits: ["ebb1eca696c42fd067658bd9b5267709f78ef38e"]
    });
    expect(configs.backportPullRequests.length).toEqual(1);
    expect(configs.backportPullRequests[0]).toEqual({
      owner: "superuser", 
      repo: "backporting-example", 
      head: "bp-prod-ebb1eca", 
      base: "prod",
      title: "[prod] Update test.txt",
      body: "**Backport:** https://my.gitlab.host.com/superuser/backporting-example/-/merge_requests/1\r\n\r\nThis is the body",
      reviewers: ["superuser"],
      assignees: [],
      labels: [],
      comments: [],
    });
  });


  test("override folder", async () => {
    const args: Args = {
      dryRun: true,
      auth: "whatever",
      pullRequest: mergedPRUrl,
      targetBranch: "prod",
      folder: "/tmp/test",
      gitUser: "Gitlab",
      gitEmail: "noreply@gitlab.com",
      reviewers: [],
      assignees: [],
      inheritReviewers: true,
    };

    const configs: Configs = await configParser.parseAndValidate(args);

    expect(GitLabClient.prototype.getPullRequest).toBeCalledTimes(1);
    expect(GitLabClient.prototype.getPullRequest).toBeCalledWith("superuser", "backporting-example", 1, true);
    expect(GitLabMapper.prototype.mapPullRequest).toBeCalledTimes(1);
    expect(GitLabMapper.prototype.mapPullRequest).toBeCalledWith(expect.anything(), []);

    expect(configs.dryRun).toEqual(true);
    expect(configs.auth).toEqual("whatever");
    expect(configs.folder).toEqual("/tmp/test");
    expect(configs.git).toEqual({
      user: "Gitlab",
      email: "noreply@gitlab.com"
    });
  });
  
  test("still open pull request", async () => {
    const args: Args = {
      dryRun: true,
      auth: "whatever",
      pullRequest: openPRUrl,
      targetBranch: "prod",
      gitUser: "Gitlab",
      gitEmail: "noreply@gitlab.com",
      reviewers: [],
      assignees: [],
      inheritReviewers: true,
    };

    const configs: Configs = await configParser.parseAndValidate(args);

    expect(GitLabClient.prototype.getPullRequest).toBeCalledTimes(1);
    expect(GitLabClient.prototype.getPullRequest).toBeCalledWith("superuser", "backporting-example", 2, true);
    expect(GitLabMapper.prototype.mapPullRequest).toBeCalledTimes(1);
    expect(GitLabMapper.prototype.mapPullRequest).toBeCalledWith(expect.anything(), []);

    expect(configs.dryRun).toEqual(true);
    expect(configs.auth).toEqual("whatever");
    expect(configs.git).toEqual({
      user: "Gitlab",
      email: "noreply@gitlab.com"
    });
    expect(configs.originalPullRequest).toEqual({
      number: 2,
      author: "superuser",
      url: "https://my.gitlab.host.com/superuser/backporting-example/-/merge_requests/2",
      htmlUrl: "https://my.gitlab.host.com/superuser/backporting-example/-/merge_requests/2",
      state: "open",
      merged: false,
      mergedBy: undefined,
      title: "Update test.txt opened",
      body: "Still opened mr body",
      reviewers: ["superuser"],
      assignees: ["superuser"],
      labels: [],
      targetRepo: {
        owner: "superuser",
        project: "backporting-example",
        cloneUrl: "https://my.gitlab.host.com/superuser/backporting-example.git"
      },
      sourceRepo: {
        owner: "superuser",
        project: "backporting-example",
        cloneUrl: "https://my.gitlab.host.com/superuser/backporting-example.git"
      },
      bpBranchName: undefined,
      nCommits: 1,
      // taken from mr.sha
      commits: ["9e15674ebd48e05c6e428a1fa31dbb60a778d644"]
    });
  });

  test("closed pull request", async () => {
    const args: Args = {
      dryRun: true,
      auth: "whatever",
      pullRequest: notMergedPRUrl,
      targetBranch: "prod",
      gitUser: "Gitlab",
      gitEmail: "noreply@gitlab.com",
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

    expect(GitLabClient.prototype.getPullRequest).toBeCalledTimes(1);
    expect(GitLabClient.prototype.getPullRequest).toBeCalledWith("superuser", "backporting-example", 1, true);
    expect(GitLabMapper.prototype.mapPullRequest).toBeCalledTimes(1);
    expect(GitLabMapper.prototype.mapPullRequest).toBeCalledWith(expect.anything(), []);

    expect(configs.dryRun).toEqual(false);
    expect(configs.git).toEqual({
      user: "Me",
      email: "me@email.com"
    });
    expect(configs.auth).toEqual("");
    expect(configs.folder).toEqual(process.cwd() + "/bp");
    expect(configs.originalPullRequest).toEqual({
      number: 1,
      author: "superuser",
      url: "https://my.gitlab.host.com/superuser/backporting-example/-/merge_requests/1",
      htmlUrl: "https://my.gitlab.host.com/superuser/backporting-example/-/merge_requests/1",
      state: "merged",
      merged: true,
      mergedBy: "superuser",
      title: "Update test.txt",
      body: "This is the body",
      reviewers: ["superuser1", "superuser2"],
      assignees: ["superuser"],
      labels: ["gitlab-original-label"],
      targetRepo: {
        owner: "superuser",
        project: "backporting-example",
        cloneUrl: "https://my.gitlab.host.com/superuser/backporting-example.git"
      },
      sourceRepo: {
        owner: "superuser",
        project: "backporting-example",
        cloneUrl: "https://my.gitlab.host.com/superuser/backporting-example.git"
      },
      nCommits: 1,
      commits: ["ebb1eca696c42fd067658bd9b5267709f78ef38e"]
    });
    expect(configs.backportPullRequests.length).toEqual(1);
    expect(configs.backportPullRequests[0]).toEqual({
      owner: "superuser", 
      repo: "backporting-example", 
      head: "bp-prod-ebb1eca", 
      base: "prod",
      title: "New Title",
      body: "New Body Prefix -New Body",
      reviewers: ["superuser"],
      assignees: [],
      labels: [],
      comments: [],
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

    expect(GitLabClient.prototype.getPullRequest).toBeCalledTimes(1);
    expect(GitLabClient.prototype.getPullRequest).toBeCalledWith("superuser", "backporting-example", 1, true);
    expect(GitLabMapper.prototype.mapPullRequest).toBeCalledTimes(1);
    expect(GitLabMapper.prototype.mapPullRequest).toBeCalledWith(expect.anything(), []);

    expect(configs.dryRun).toEqual(false);
    expect(configs.git).toEqual({
      user: "Me",
      email: "me@email.com"
    });
    expect(configs.auth).toEqual("");
    expect(configs.folder).toEqual(process.cwd() + "/bp");
    expect(configs.originalPullRequest).toEqual({
      number: 1,
      author: "superuser",
      url: "https://my.gitlab.host.com/superuser/backporting-example/-/merge_requests/1",
      htmlUrl: "https://my.gitlab.host.com/superuser/backporting-example/-/merge_requests/1",
      state: "merged",
      merged: true,
      mergedBy: "superuser",
      title: "Update test.txt",
      body: "This is the body",
      reviewers: ["superuser1", "superuser2"],
      assignees: ["superuser"],
      labels: ["gitlab-original-label"],
      targetRepo: {
        owner: "superuser",
        project: "backporting-example",
        cloneUrl: "https://my.gitlab.host.com/superuser/backporting-example.git"
      },
      sourceRepo: {
        owner: "superuser",
        project: "backporting-example",
        cloneUrl: "https://my.gitlab.host.com/superuser/backporting-example.git"
      },
      nCommits: 1,
      commits: ["ebb1eca696c42fd067658bd9b5267709f78ef38e"]
    });
    expect(configs.backportPullRequests.length).toEqual(1);
    expect(configs.backportPullRequests[0]).toEqual({
      owner: "superuser", 
      repo: "backporting-example", 
      head: "bp-prod-ebb1eca", 
      base: "prod",
      title: "New Title",
      body: "New Body Prefix -New Body",
      reviewers: ["user1", "user2"],
      assignees: ["user3", "user4"],
      labels: [],
      comments: [],
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

    expect(GitLabClient.prototype.getPullRequest).toBeCalledTimes(1);
    expect(GitLabClient.prototype.getPullRequest).toBeCalledWith("superuser", "backporting-example", 1, true);
    expect(GitLabMapper.prototype.mapPullRequest).toBeCalledTimes(1);
    expect(GitLabMapper.prototype.mapPullRequest).toBeCalledWith(expect.anything(), []);

    expect(configs.dryRun).toEqual(false);
    expect(configs.git).toEqual({
      user: "Me",
      email: "me@email.com"
    });
    expect(configs.auth).toEqual("");
    expect(configs.folder).toEqual(process.cwd() + "/bp");
    expect(configs.originalPullRequest).toEqual({
      number: 1,
      author: "superuser",
      url: "https://my.gitlab.host.com/superuser/backporting-example/-/merge_requests/1",
      htmlUrl: "https://my.gitlab.host.com/superuser/backporting-example/-/merge_requests/1",
      state: "merged",
      merged: true,
      mergedBy: "superuser",
      title: "Update test.txt",
      body: "This is the body",
      reviewers: ["superuser1", "superuser2"],
      assignees: ["superuser"],
      labels: ["gitlab-original-label"],
      targetRepo: {
        owner: "superuser",
        project: "backporting-example",
        cloneUrl: "https://my.gitlab.host.com/superuser/backporting-example.git"
      },
      sourceRepo: {
        owner: "superuser",
        project: "backporting-example",
        cloneUrl: "https://my.gitlab.host.com/superuser/backporting-example.git"
      },
      nCommits: 1,
      commits: ["ebb1eca696c42fd067658bd9b5267709f78ef38e"]
    });
    expect(configs.backportPullRequests.length).toEqual(1);
    expect(configs.backportPullRequests[0]).toEqual({
      owner: "superuser", 
      repo: "backporting-example", 
      head: "bp-prod-ebb1eca", 
      base: "prod",
      title: "New Title",
      body: "New Body Prefix -New Body",
      reviewers: [],
      assignees: ["user3", "user4"],
      labels: [],
      comments: [],
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
      labels: ["custom-label", "gitlab-original-label"], // also include the one inherited
      inheritLabels: true,
    };

    const configs: Configs = await configParser.parseAndValidate(args);

    expect(GitLabClient.prototype.getPullRequest).toBeCalledTimes(1);
    expect(GitLabClient.prototype.getPullRequest).toBeCalledWith("superuser", "backporting-example", 1, true);
    expect(GitLabMapper.prototype.mapPullRequest).toBeCalledTimes(1);
    expect(GitLabMapper.prototype.mapPullRequest).toBeCalledWith(expect.anything(), []);

    expect(configs.dryRun).toEqual(false);
    expect(configs.git).toEqual({
      user: "Me",
      email: "me@email.com"
    });
    expect(configs.auth).toEqual("");
    expect(configs.folder).toEqual(process.cwd() + "/bp");
    expect(configs.originalPullRequest).toEqual({
      number: 1,
      author: "superuser",
      url: "https://my.gitlab.host.com/superuser/backporting-example/-/merge_requests/1",
      htmlUrl: "https://my.gitlab.host.com/superuser/backporting-example/-/merge_requests/1",
      state: "merged",
      merged: true,
      mergedBy: "superuser",
      title: "Update test.txt",
      body: "This is the body",
      reviewers: ["superuser1", "superuser2"],
      assignees: ["superuser"],
      labels: ["gitlab-original-label"],
      targetRepo: {
        owner: "superuser",
        project: "backporting-example",
        cloneUrl: "https://my.gitlab.host.com/superuser/backporting-example.git"
      },
      sourceRepo: {
        owner: "superuser",
        project: "backporting-example",
        cloneUrl: "https://my.gitlab.host.com/superuser/backporting-example.git"
      },
      nCommits: 1,
      commits: ["ebb1eca696c42fd067658bd9b5267709f78ef38e"]
    });
    expect(configs.backportPullRequests.length).toEqual(1);
    expect(configs.backportPullRequests[0]).toEqual({
      owner: "superuser", 
      repo: "backporting-example", 
      head: "bp-prod-ebb1eca", 
      base: "prod",
      title: "New Title",
      body: "New Body Prefix -New Body",
      reviewers: [],
      assignees: ["user3", "user4"],
      labels: ["custom-label", "gitlab-original-label"],
      comments: [],
    });
  });
    
  test("using simple config file", async () => {
    spyGetInput({
      "config-file": GITLAB_MERGED_PR_SIMPLE_CONFIG_FILE_CONTENT_PATHNAME,
    });

    const args: Args = argsParser.parse();
    const configs: Configs = await configParser.parseAndValidate(args);

    expect(GitLabClient.prototype.getPullRequest).toBeCalledTimes(1);
    expect(GitLabClient.prototype.getPullRequest).toBeCalledWith("superuser", "backporting-example", 1, true);
    expect(GitLabMapper.prototype.mapPullRequest).toBeCalledTimes(1);
    expect(GitLabMapper.prototype.mapPullRequest).toBeCalledWith(expect.anything(), []);

    expect(configs.dryRun).toEqual(false);
    expect(configs.git).toEqual({
      user: "Gitlab",
      email: "noreply@gitlab.com"
    });
    expect(configs.auth).toEqual(undefined);
    expect(configs.folder).toEqual(process.cwd() + "/bp");
    expect(configs.originalPullRequest).toEqual({
      number: 1,
      author: "superuser",
      url: "https://my.gitlab.host.com/superuser/backporting-example/-/merge_requests/1",
      htmlUrl: "https://my.gitlab.host.com/superuser/backporting-example/-/merge_requests/1",
      state: "merged",
      merged: true,
      mergedBy: "superuser",
      title: "Update test.txt",
      body: "This is the body",
      reviewers: ["superuser1", "superuser2"],
      assignees: ["superuser"],
      labels: ["gitlab-original-label"],
      targetRepo: {
        owner: "superuser",
        project: "backporting-example",
        cloneUrl: "https://my.gitlab.host.com/superuser/backporting-example.git"
      },
      sourceRepo: {
        owner: "superuser",
        project: "backporting-example",
        cloneUrl: "https://my.gitlab.host.com/superuser/backporting-example.git"
      },
      nCommits: 1,
      commits: ["ebb1eca696c42fd067658bd9b5267709f78ef38e"]
    });
    expect(configs.backportPullRequests.length).toEqual(1);
    expect(configs.backportPullRequests[0]).toEqual({
      owner: "superuser", 
      repo: "backporting-example", 
      head: "bp-prod-ebb1eca", 
      base: "prod",
      title: "[prod] Update test.txt",
      body: "**Backport:** https://my.gitlab.host.com/superuser/backporting-example/-/merge_requests/1\r\n\r\nThis is the body",
      reviewers: ["superuser"],
      assignees: [],
      labels: [],
      comments: [],
    });
  });

  test("using complex config file", async () => {
    spyGetInput({
      "config-file": GITLAB_MERGED_PR_COMPLEX_CONFIG_FILE_CONTENT_PATHNAME,
    });

    const args: Args = argsParser.parse();
    const configs: Configs = await configParser.parseAndValidate(args);

    expect(GitLabClient.prototype.getPullRequest).toBeCalledTimes(1);
    expect(GitLabClient.prototype.getPullRequest).toBeCalledWith("superuser", "backporting-example", 1, true);
    expect(GitLabMapper.prototype.mapPullRequest).toBeCalledTimes(1);
    expect(GitLabMapper.prototype.mapPullRequest).toBeCalledWith(expect.anything(), []);

    expect(configs.dryRun).toEqual(false);
    expect(configs.git).toEqual({
      user: "Me",
      email: "me@email.com"
    });
    expect(configs.auth).toEqual("my-token");
    expect(configs.folder).toEqual(process.cwd() + "/bp");
    expect(configs.originalPullRequest).toEqual({
      number: 1,
      author: "superuser",
      url: "https://my.gitlab.host.com/superuser/backporting-example/-/merge_requests/1",
      htmlUrl: "https://my.gitlab.host.com/superuser/backporting-example/-/merge_requests/1",
      state: "merged",
      merged: true,
      mergedBy: "superuser",
      title: "Update test.txt",
      body: "This is the body",
      reviewers: ["superuser1", "superuser2"],
      assignees: ["superuser"],
      labels: ["gitlab-original-label"],
      targetRepo: {
        owner: "superuser",
        project: "backporting-example",
        cloneUrl: "https://my.gitlab.host.com/superuser/backporting-example.git"
      },
      sourceRepo: {
        owner: "superuser",
        project: "backporting-example",
        cloneUrl: "https://my.gitlab.host.com/superuser/backporting-example.git"
      },
      nCommits: 1,
      commits: ["ebb1eca696c42fd067658bd9b5267709f78ef38e"]
    });
    expect(configs.backportPullRequests.length).toEqual(1);
    expect(configs.backportPullRequests[0]).toEqual({
      owner: "superuser", 
      repo: "backporting-example", 
      head: "bp-prod-ebb1eca", 
      base: "prod",
      title: "New Title",
      body: "New Body Prefix -New Body",
      reviewers: [],
      assignees: ["user3", "user4"],
      labels: ["cherry-pick :cherries:", "gitlab-original-label"],
      comments: [],
    });
  });

  test("still open pull request without squash", async () => {
    const args: Args = {
      dryRun: true,
      auth: "whatever",
      pullRequest: openPRUrl,
      targetBranch: "prod",
      gitUser: "Gitlab",
      gitEmail: "noreply@gitlab.com",
      reviewers: [],
      assignees: [],
      inheritReviewers: true,
      squash: false,
    };

    const configs: Configs = await configParser.parseAndValidate(args);

    expect(GitLabClient.prototype.getPullRequest).toBeCalledTimes(1);
    expect(GitLabClient.prototype.getPullRequest).toBeCalledWith("superuser", "backporting-example", 2, false);
    expect(GitLabMapper.prototype.mapPullRequest).toBeCalledTimes(1);
    expect(GitLabMapper.prototype.mapPullRequest).toBeCalledWith(expect.anything(), ["e4dd336a4a20f394df6665994df382fb1d193a11", "974519f65c9e0ed65277cd71026657a09fca05e7"]);

    expect(configs.dryRun).toEqual(true);
    expect(configs.auth).toEqual("whatever");
    expect(configs.git).toEqual({
      user: "Gitlab",
      email: "noreply@gitlab.com"
    });
    expect(configs.originalPullRequest).toEqual({
      number: 2,
      author: "superuser",
      url: "https://my.gitlab.host.com/superuser/backporting-example/-/merge_requests/2",
      htmlUrl: "https://my.gitlab.host.com/superuser/backporting-example/-/merge_requests/2",
      state: "open",
      merged: false,
      mergedBy: undefined,
      title: "Update test.txt opened",
      body: "Still opened mr body",
      reviewers: ["superuser"],
      assignees: ["superuser"],
      labels: [],
      targetRepo: {
        owner: "superuser",
        project: "backporting-example",
        cloneUrl: "https://my.gitlab.host.com/superuser/backporting-example.git"
      },
      sourceRepo: {
        owner: "superuser",
        project: "backporting-example",
        cloneUrl: "https://my.gitlab.host.com/superuser/backporting-example.git"
      },
      bpBranchName: undefined,
      nCommits: 2,
      commits: ["e4dd336a4a20f394df6665994df382fb1d193a11", "974519f65c9e0ed65277cd71026657a09fca05e7"]
    });
    expect(configs.backportPullRequests.length).toEqual(1);
    expect(configs.backportPullRequests[0]).toEqual({
      owner: "superuser", 
      repo: "backporting-example", 
      head: "bp-prod-e4dd336-974519f", 
      base: "prod",
      title: "[prod] Update test.txt opened",
      body: "**Backport:** https://my.gitlab.host.com/superuser/backporting-example/-/merge_requests/2\r\n\r\nStill opened mr body",
      reviewers: ["superuser"],
      assignees: [],
      labels: [],
      comments: [],
    });
  });

  test("override backport pr with additional comments", async () => {
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
      labels: [],
      inheritLabels: false,
      comments: ["First comment", "Second comment"],
    };

    const configs: Configs = await configParser.parseAndValidate(args);

    expect(GitLabClient.prototype.getPullRequest).toBeCalledTimes(1);
    expect(GitLabClient.prototype.getPullRequest).toBeCalledWith("superuser", "backporting-example", 1, true);
    expect(GitLabMapper.prototype.mapPullRequest).toBeCalledTimes(1);
    expect(GitLabMapper.prototype.mapPullRequest).toBeCalledWith(expect.anything(), []);

    expect(configs.dryRun).toEqual(false);
    expect(configs.git).toEqual({
      user: "Me",
      email: "me@email.com"
    });
    expect(configs.auth).toEqual("");
    expect(configs.folder).toEqual(process.cwd() + "/bp");
    expect(configs.originalPullRequest).toEqual({
      number: 1,
      author: "superuser",
      url: "https://my.gitlab.host.com/superuser/backporting-example/-/merge_requests/1",
      htmlUrl: "https://my.gitlab.host.com/superuser/backporting-example/-/merge_requests/1",
      state: "merged",
      merged: true,
      mergedBy: "superuser",
      title: "Update test.txt",
      body: "This is the body",
      reviewers: ["superuser1", "superuser2"],
      assignees: ["superuser"],
      labels: ["gitlab-original-label"],
      targetRepo: {
        owner: "superuser",
        project: "backporting-example",
        cloneUrl: "https://my.gitlab.host.com/superuser/backporting-example.git"
      },
      sourceRepo: {
        owner: "superuser",
        project: "backporting-example",
        cloneUrl: "https://my.gitlab.host.com/superuser/backporting-example.git"
      },
      nCommits: 1,
      commits: ["ebb1eca696c42fd067658bd9b5267709f78ef38e"]
    });
    expect(configs.backportPullRequests.length).toEqual(1);
    expect(configs.backportPullRequests[0]).toEqual({
      owner: "superuser", 
      repo: "backporting-example", 
      head: "bp-prod-ebb1eca", 
      base: "prod",
      title: "New Title",
      body: "New Body Prefix -New Body",
      reviewers: [],
      assignees: ["user3", "user4"],
      labels: [],
      comments: ["First comment", "Second comment"],
    });
  });
});