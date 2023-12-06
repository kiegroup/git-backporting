import { Args } from "@bp/service/args/args.types";
import { Configs } from "@bp/service/configs/configs.types";
import PullRequestConfigsParser from "@bp/service/configs/pullrequest/pr-configs-parser";
import GitClientFactory from "@bp/service/git/git-client-factory";
import { GitClientType } from "@bp/service/git/git.types";
import { getAxiosMocked } from "../../../support/mock/git-client-mock-support";
import { MERGED_SQUASHED_MR } from "../../../support/mock/gitlab-data";
import GitLabClient from "@bp/service/git/gitlab/gitlab-client";
import GitLabMapper from "@bp/service/git/gitlab/gitlab-mapper";
import { resetEnvTokens } from "../../../support/utils";

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

  let configParser: PullRequestConfigsParser;

  beforeAll(() => {
    GitClientFactory.reset();
    GitClientFactory.getOrCreate(GitClientType.GITLAB, "whatever", "my.gitlab.host.com");
  });

  beforeEach(() => {
    // reset env tokens
    resetEnvTokens();

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

    expect(GitLabClient.prototype.getPullRequest).toBeCalledTimes(1);
    expect(GitLabClient.prototype.getPullRequest).toBeCalledWith("superuser", "backporting-example", 1, true);
    expect(GitLabMapper.prototype.mapPullRequest).toBeCalledTimes(1);
    expect(GitLabMapper.prototype.mapPullRequest).toBeCalledWith(expect.anything(), []);

    expect(configs.dryRun).toEqual(false);
    expect(configs.auth).toEqual("");
    expect(configs.folder).toEqual(process.cwd() + "/bp");
    expect(configs.backportPullRequests.length).toEqual(3);
    expect(configs.backportPullRequests).toEqual(
      expect.arrayContaining([
        {
          owner: "superuser", 
          repo: "backporting-example", 
          head: "bp-v1-ebb1eca", 
          base: "v1",
          title: "New Title",
          body: "New Body Prefix -New Body",
          reviewers: [],
          assignees: ["user3", "user4"],
          labels: [],
          comments: [],
        },
        {
          owner: "superuser", 
          repo: "backporting-example", 
          head: "bp-v2-ebb1eca", 
          base: "v2",
          title: "New Title",
          body: "New Body Prefix -New Body",
          reviewers: [],
          assignees: ["user3", "user4"],
          labels: [],
          comments: [],
        },
        {
          owner: "superuser", 
          repo: "backporting-example", 
          head: "bp-v3-ebb1eca", 
          base: "v3",
          title: "New Title",
          body: "New Body Prefix -New Body",
          reviewers: [],
          assignees: ["user3", "user4"],
          labels: [],
          comments: [],
        }
      ])
    );
  });

  test("multiple backports ignore duplicates", async () => {
    const args: Args = {
      dryRun: false,
      auth: "",
      pullRequest: mergedPRUrl,
      targetBranch: "v1, v2, v3, v1",
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

    expect(GitLabClient.prototype.getPullRequest).toBeCalledTimes(1);
    expect(GitLabClient.prototype.getPullRequest).toBeCalledWith("superuser", "backporting-example", 1, true);
    expect(GitLabMapper.prototype.mapPullRequest).toBeCalledTimes(1);
    expect(GitLabMapper.prototype.mapPullRequest).toBeCalledWith(expect.anything(), []);

    expect(configs.dryRun).toEqual(false);
    expect(configs.auth).toEqual("");
    expect(configs.folder).toEqual(process.cwd() + "/bp");
    expect(configs.backportPullRequests.length).toEqual(3);
    expect(configs.backportPullRequests).toEqual(
      expect.arrayContaining([
        {
          owner: "superuser", 
          repo: "backporting-example", 
          head: "bp-v1-ebb1eca", 
          base: "v1",
          title: "New Title",
          body: "New Body Prefix -New Body",
          reviewers: [],
          assignees: ["user3", "user4"],
          labels: [],
          comments: [],
        },
        {
          owner: "superuser", 
          repo: "backporting-example", 
          head: "bp-v2-ebb1eca", 
          base: "v2",
          title: "New Title",
          body: "New Body Prefix -New Body",
          reviewers: [],
          assignees: ["user3", "user4"],
          labels: [],
          comments: [],
        },
        {
          owner: "superuser", 
          repo: "backporting-example", 
          head: "bp-v3-ebb1eca", 
          base: "v3",
          title: "New Title",
          body: "New Body Prefix -New Body",
          reviewers: [],
          assignees: ["user3", "user4"],
          labels: [],
          comments: [],
        }
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
      bpBranchName: "custom-branch"
    };

    const configs: Configs = await configParser.parseAndValidate(args);

    expect(GitLabClient.prototype.getPullRequest).toBeCalledTimes(1);
    expect(GitLabClient.prototype.getPullRequest).toBeCalledWith("superuser", "backporting-example", 1, true);
    expect(GitLabMapper.prototype.mapPullRequest).toBeCalledTimes(1);
    expect(GitLabMapper.prototype.mapPullRequest).toBeCalledWith(expect.anything(), []);

    expect(configs.dryRun).toEqual(false);
    expect(configs.auth).toEqual("");
    expect(configs.folder).toEqual(process.cwd() + "/bp");
    expect(configs.backportPullRequests.length).toEqual(3);
    expect(configs.backportPullRequests).toEqual(
      expect.arrayContaining([
        {
          owner: "superuser", 
          repo: "backporting-example", 
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
          owner: "superuser", 
          repo: "backporting-example", 
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
          owner: "superuser", 
          repo: "backporting-example", 
          head: "custom-branch-v3", 
          base: "v3",
          title: "New Title",
          body: "New Body Prefix -New Body",
          reviewers: [],
          assignees: ["user3", "user4"],
          labels: [],
          comments: [],
        }
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
      bpBranchName: "custom1, custom2, custom3"
    };

    const configs: Configs = await configParser.parseAndValidate(args);

    expect(GitLabClient.prototype.getPullRequest).toBeCalledTimes(1);
    expect(GitLabClient.prototype.getPullRequest).toBeCalledWith("superuser", "backporting-example", 1, true);
    expect(GitLabMapper.prototype.mapPullRequest).toBeCalledTimes(1);
    expect(GitLabMapper.prototype.mapPullRequest).toBeCalledWith(expect.anything(), []);

    expect(configs.dryRun).toEqual(false);
    expect(configs.auth).toEqual("");
    expect(configs.folder).toEqual(process.cwd() + "/bp");
    expect(configs.backportPullRequests.length).toEqual(3);
    expect(configs.backportPullRequests).toEqual(
      expect.arrayContaining([
        {
          owner: "superuser", 
          repo: "backporting-example", 
          head: "custom1", 
          base: "v1",
          title: "New Title",
          body: "New Body Prefix -New Body",
          reviewers: [],
          assignees: ["user3", "user4"],
          labels: [],
          comments: [],
        },
        {
          owner: "superuser", 
          repo: "backporting-example", 
          head: "custom2", 
          base: "v2",
          title: "New Title",
          body: "New Body Prefix -New Body",
          reviewers: [],
          assignees: ["user3", "user4"],
          labels: [],
          comments: [],
        },
        {
          owner: "superuser", 
          repo: "backporting-example", 
          head: "custom3", 
          base: "v3",
          title: "New Title",
          body: "New Body Prefix -New Body",
          reviewers: [],
          assignees: ["user3", "user4"],
          labels: [],
          comments: [],
        }
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
      bpBranchName: "custom-branch1, custom-branch2, custom-branch2, custom-branch3, custom-branch4",
    };

    await expect(() => configParser.parseAndValidate(args)).rejects.toThrow("The number of backport branch names, if provided, must match the number of target branches or just one, provided 4 branch names instead");
  });
});