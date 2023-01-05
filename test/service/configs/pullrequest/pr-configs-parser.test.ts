import { Args } from "@bp/service/args/args.types";
import { Configs } from "@bp/service/configs/configs.types";
import PullRequestConfigsParser from "@bp/service/configs/pullrequest/pr-configs-parser";
import GitServiceFactory from "@bp/service/git/git-service-factory";
import { GitServiceType } from "@bp/service/git/git.types";
import { setupMoctokit } from "../../../support/moctokit/moctokit-support";
import { mergedPullRequestFixture, openPullRequestFixture, notMergedPullRequestFixture, repo, targetOwner } from "../../../support/moctokit/moctokit-data";

describe("pull request config parser", () => {

  const mergedPRUrl = `https://github.com/${targetOwner}/${repo}/pull/${mergedPullRequestFixture.number}`;
  const openPRUrl = `https://github.com/${targetOwner}/${repo}/pull/${openPullRequestFixture.number}`;
  const notMergedPRUrl = `https://github.com/${targetOwner}/${repo}/pull/${notMergedPullRequestFixture.number}`;
  
  let parser: PullRequestConfigsParser;

  beforeAll(() => {
    GitServiceFactory.init(GitServiceType.GITHUB, "whatever");
  });

  beforeEach(() => {
    setupMoctokit();

    parser = new PullRequestConfigsParser();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("parse configs from pull request", async () => {
    const args: Args = {
      dryRun: false,
      auth: "",
      pullRequest: mergedPRUrl,
      targetBranch: "prod"
    };

    const configs: Configs = await parser.parseAndValidate(args);

    expect(configs.dryRun).toEqual(false);
    expect(configs.author).toEqual("gh-user");
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
      author: "gh-user",
      url: undefined,
      htmlUrl: undefined,
      title: "[prod] PR Title",
      body: "**Backport:** https://github.com/owner/reponame/pull/2368\r\n\r\nPlease review and merge\r\n\r\nPowered by [BPer](https://github.com/lampajr/backporting).",
      reviewers: ["gh-user", "that-s-a-user"],
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
      nCommits: 0,
      commits: []
    });
  });

  test("override folder", async () => {
    const args: Args = {
      dryRun: true,
      auth: "whatever",
      pullRequest: mergedPRUrl,
      targetBranch: "prod",
      folder: "/tmp/test"
    };

    const configs: Configs = await parser.parseAndValidate(args);

    expect(configs.dryRun).toEqual(true);
    expect(configs.auth).toEqual("whatever");
    expect(configs.targetBranch).toEqual("prod");
    expect(configs.folder).toEqual("/tmp/test");
  });

  test("override author", async () => {
    const args: Args = {
      dryRun: true,
      auth: "whatever",
      pullRequest: mergedPRUrl,
      targetBranch: "prod",
      author: "another-user"
    };

    const configs: Configs = await parser.parseAndValidate(args);

    expect(configs.dryRun).toEqual(true);
    expect(configs.auth).toEqual("whatever");
    expect(configs.targetBranch).toEqual("prod");
    expect(configs.author).toEqual("another-user");
  });

  test("still open pull request", async () => {
    const args: Args = {
      dryRun: true,
      auth: "whatever",
      pullRequest: openPRUrl,
      targetBranch: "prod"
    };

    const configs: Configs = await parser.parseAndValidate(args);

    expect(configs.dryRun).toEqual(true);
    expect(configs.auth).toEqual("whatever");
    expect(configs.targetBranch).toEqual("prod");
    expect(configs.author).toEqual("gh-user");
    expect(configs.originalPullRequest).toEqual({
      number: 4444,
      author: "gh-user",
      url: "https://api.github.com/repos/owner/reponame/pulls/4444",
      htmlUrl: "https://github.com/owner/reponame/pull/4444",
      state: "open",
      merged: false,
      mergedBy: "that-s-a-user",
      title: "PR Title",
      body: "Please review and merge",
      reviewers: ["gh-user"],
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
      // taken from head.sha
      commits: ["91748965051fae1330ad58d15cf694e103267c87"]
    });
  });

  test("closed pull request", async () => {
    const args: Args = {
      dryRun: true,
      auth: "whatever",
      pullRequest: notMergedPRUrl,
      targetBranch: "prod"
    };

    expect(async () => await parser.parseAndValidate(args)).rejects.toThrow("Provided pull request is closed and not merged!");
  });
});