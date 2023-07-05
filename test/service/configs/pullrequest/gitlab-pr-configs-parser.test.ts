import { Args } from "@bp/service/args/args.types";
import { Configs } from "@bp/service/configs/configs.types";
import PullRequestConfigsParser from "@bp/service/configs/pullrequest/pr-configs-parser";
import GitClientFactory from "@bp/service/git/git-client-factory";
import { GitClientType } from "@bp/service/git/git.types";
import { getAxiosMocked } from "../../../support/mock/git-client-mock-support";
import { CLOSED_NOT_MERGED_MR, MERGED_SQUASHED_MR, OPEN_MR } from "../../../support/mock/gitlab-data";
import GHAArgsParser from "@bp/service/args/gha/gha-args-parser";
import { createTestFile, removeTestFile, spyGetInput } from "../../../support/utils";

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
};


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
    argsParser = new GHAArgsParser();
    configParser = new PullRequestConfigsParser();
  });

  afterEach(() => {
    jest.clearAllMocks();
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

    expect(configs.dryRun).toEqual(false);
    expect(configs.git).toEqual({
      user: "Gitlab",
      email: "noreply@gitlab.com"
    });
    expect(configs.auth).toEqual(undefined);
    expect(configs.targetBranch).toEqual("prod");
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
    expect(configs.backportPullRequest).toEqual({
      author: "Gitlab",
      url: undefined,
      htmlUrl: undefined,
      title: "[prod] Update test.txt",
      body: "**Backport:** https://my.gitlab.host.com/superuser/backporting-example/-/merge_requests/1\r\n\r\nThis is the body",
      reviewers: ["superuser"],
      assignees: [],
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

    expect(configs.dryRun).toEqual(true);
    expect(configs.auth).toEqual("whatever");
    expect(configs.targetBranch).toEqual("prod");
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

    expect(configs.dryRun).toEqual(true);
    expect(configs.auth).toEqual("whatever");
    expect(configs.targetBranch).toEqual("prod");
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

    expect(async () => await configParser.parseAndValidate(args)).rejects.toThrow("Provided pull request is closed and not merged!");
  });

  test("override backport pr data inherting reviewers", async () => {
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

    expect(configs.dryRun).toEqual(false);
    expect(configs.git).toEqual({
      user: "Me",
      email: "me@email.com"
    });
    expect(configs.auth).toEqual("");
    expect(configs.targetBranch).toEqual("prod");
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
    expect(configs.backportPullRequest).toEqual({
      author: "Me",
      url: undefined,
      htmlUrl: undefined,
      title: "New Title",
      body: "New Body Prefix -New Body",
      reviewers: ["superuser"],
      assignees: [],
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

    expect(configs.dryRun).toEqual(false);
    expect(configs.git).toEqual({
      user: "Me",
      email: "me@email.com"
    });
    expect(configs.auth).toEqual("");
    expect(configs.targetBranch).toEqual("prod");
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
    expect(configs.backportPullRequest).toEqual({
      author: "Me",
      url: undefined,
      htmlUrl: undefined,
      title: "New Title",
      body: "New Body Prefix -New Body",
      reviewers: ["user1", "user2"],
      assignees: ["user3", "user4"],
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

    expect(configs.dryRun).toEqual(false);
    expect(configs.git).toEqual({
      user: "Me",
      email: "me@email.com"
    });
    expect(configs.auth).toEqual("");
    expect(configs.targetBranch).toEqual("prod");
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
    expect(configs.backportPullRequest).toEqual({
      author: "Me",
      url: undefined,
      htmlUrl: undefined,
      title: "New Title",
      body: "New Body Prefix -New Body",
      reviewers: [],
      assignees: ["user3", "user4"],
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
    });
  });

    
  test("using simple config file", async () => {
    spyGetInput({
      "config-file": GITLAB_MERGED_PR_SIMPLE_CONFIG_FILE_CONTENT_PATHNAME,
    });

    const args: Args = argsParser.parse();
    const configs: Configs = await configParser.parseAndValidate(args);

    expect(configs.dryRun).toEqual(false);
    expect(configs.git).toEqual({
      user: "Gitlab",
      email: "noreply@gitlab.com"
    });
    expect(configs.auth).toEqual(undefined);
    expect(configs.targetBranch).toEqual("prod");
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
    expect(configs.backportPullRequest).toEqual({
      author: "Gitlab",
      url: undefined,
      htmlUrl: undefined,
      title: "[prod] Update test.txt",
      body: "**Backport:** https://my.gitlab.host.com/superuser/backporting-example/-/merge_requests/1\r\n\r\nThis is the body",
      reviewers: ["superuser"],
      assignees: [],
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
    });
  });

  test("using complex config file", async () => {
    spyGetInput({
      "config-file": GITLAB_MERGED_PR_COMPLEX_CONFIG_FILE_CONTENT_PATHNAME,
    });

    const args: Args = argsParser.parse();
    const configs: Configs = await configParser.parseAndValidate(args);

    expect(configs.dryRun).toEqual(false);
    expect(configs.git).toEqual({
      user: "Me",
      email: "me@email.com"
    });
    expect(configs.auth).toEqual("my-token");
    expect(configs.targetBranch).toEqual("prod");
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
    expect(configs.backportPullRequest).toEqual({
      author: "Me",
      url: undefined,
      htmlUrl: undefined,
      title: "New Title",
      body: "New Body Prefix -New Body",
      reviewers: [],
      assignees: ["user3", "user4"],
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
    });
  });
});