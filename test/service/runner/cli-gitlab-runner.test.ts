import ArgsParser from "@bp/service/args/args-parser";
import Runner from "@bp/service/runner/runner";
import GitCLIService from "@bp/service/git/git-cli";
import GitLabClient from "@bp/service/git/gitlab/gitlab-client";
import CLIArgsParser from "@bp/service/args/cli/cli-args-parser";
import { addProcessArgs, createTestFile, removeTestFile, resetEnvTokens, resetProcessArgs } from "../../support/utils";
import { getAxiosMocked } from "../../support/mock/git-client-mock-support";
import { MERGED_SQUASHED_MR } from "../../support/mock/gitlab-data";
import GitClientFactory from "@bp/service/git/git-client-factory";
import { GitClientType } from "@bp/service/git/git.types";
import { AuthTokenId } from "@bp/service/configs/configs.types";

const GITLAB_MERGED_PR_COMPLEX_CONFIG_FILE_CONTENT_PATHNAME = "./cli-gitlab-runner-pr-merged-with-overrides.json";
const GITLAB_MERGED_PR_COMPLEX_CONFIG_FILE_CONTENT = {
  "dryRun": false,
  "auth": "my-token",
  "pullRequest": `https://my.gitlab.host.com/superuser/backporting-example/-/merge_requests/${MERGED_SQUASHED_MR.iid}`,
  "targetBranch": "prod",
  "gitUser": "Me",
  "gitEmail": "me@email.com",
  "title": "New Title",
  "body": "New Body",
  "bodyPrefix": `**This is a backport:** https://my.gitlab.host.com/superuser/backporting-example/-/merge_requests/${MERGED_SQUASHED_MR.iid}`,
  "reviewers": [],
  "assignees": ["user3", "user4"],
  "inheritReviewers": false,
  "labels": ["cli gitlab cherry pick :cherries:"],
  "inheritLabels": true,
};

jest.mock("axios", () => {
  return {
    create: () => ({
      get: getAxiosMocked,
      post: () => ({
        data: {
          iid: 1, // FIXME: I am not testing this atm
        }
      }),
      put: async () => undefined,
    }),
  };
});

jest.mock("@bp/service/git/git-cli");
jest.spyOn(GitLabClient.prototype, "createPullRequest");
jest.spyOn(GitClientFactory, "getOrCreate");


let parser: ArgsParser;
let runner: Runner;

beforeAll(() => {
  // create a temporary file
  createTestFile(GITLAB_MERGED_PR_COMPLEX_CONFIG_FILE_CONTENT_PATHNAME, JSON.stringify(GITLAB_MERGED_PR_COMPLEX_CONFIG_FILE_CONTENT));
});

afterAll(() => {
  // clean up all temporary files
  removeTestFile(GITLAB_MERGED_PR_COMPLEX_CONFIG_FILE_CONTENT_PATHNAME);
});

beforeEach(() => {
  // reset process.env variables
  resetProcessArgs();

  // reset git env tokens
  resetEnvTokens();

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
      "https://my.gitlab.host.com/superuser/backporting-example/-/merge_requests/2"
    ]);
    
    await runner.execute();

    const cwd = process.cwd() + "/bp";

    expect(GitClientFactory.getOrCreate).toBeCalledTimes(1);
    expect(GitClientFactory.getOrCreate).toBeCalledWith(GitClientType.GITLAB, undefined, "https://my.gitlab.host.com/api/v4");

    expect(GitCLIService.prototype.clone).toBeCalledTimes(1);
    expect(GitCLIService.prototype.clone).toBeCalledWith("https://my.gitlab.host.com/superuser/backporting-example.git", cwd, "target");

    expect(GitCLIService.prototype.createLocalBranch).toBeCalledTimes(1);
    expect(GitCLIService.prototype.createLocalBranch).toBeCalledWith(cwd, "bp-target-9e15674");
    
    expect(GitCLIService.prototype.fetch).toBeCalledTimes(1);
    expect(GitCLIService.prototype.fetch).toBeCalledWith(cwd, "merge-requests/2/head:pr/2");

    expect(GitCLIService.prototype.cherryPick).toBeCalledTimes(1);
    expect(GitCLIService.prototype.cherryPick).toBeCalledWith(cwd, "9e15674ebd48e05c6e428a1fa31dbb60a778d644", undefined, undefined);

    expect(GitCLIService.prototype.push).toBeCalledTimes(0);
    expect(GitLabClient.prototype.createPullRequest).toBeCalledTimes(0);
  });

  test("dry run with relative folder", async () => {
    addProcessArgs([
      "-d",
      "-tb",
      "target",
      "-pr",
      "https://my.gitlab.host.com/superuser/backporting-example/-/merge_requests/2",
      "-f",
      "folder"
    ]);
    
    await runner.execute();

    const cwd = process.cwd() + "/folder";

    expect(GitClientFactory.getOrCreate).toBeCalledTimes(1);
    expect(GitClientFactory.getOrCreate).toBeCalledWith(GitClientType.GITLAB, undefined, "https://my.gitlab.host.com/api/v4");

    expect(GitCLIService.prototype.clone).toBeCalledTimes(1);
    expect(GitCLIService.prototype.clone).toBeCalledWith("https://my.gitlab.host.com/superuser/backporting-example.git", cwd, "target");

    expect(GitCLIService.prototype.createLocalBranch).toBeCalledTimes(1);
    expect(GitCLIService.prototype.createLocalBranch).toBeCalledWith(cwd, "bp-target-9e15674");
    
    expect(GitCLIService.prototype.fetch).toBeCalledTimes(1);
    expect(GitCLIService.prototype.fetch).toBeCalledWith(cwd, "merge-requests/2/head:pr/2");

    expect(GitCLIService.prototype.cherryPick).toBeCalledTimes(1);
    expect(GitCLIService.prototype.cherryPick).toBeCalledWith(cwd, "9e15674ebd48e05c6e428a1fa31dbb60a778d644", undefined, undefined);

    expect(GitCLIService.prototype.addRemote).toBeCalledTimes(0);
    expect(GitCLIService.prototype.addRemote).toBeCalledTimes(0);

    expect(GitCLIService.prototype.push).toBeCalledTimes(0);
    expect(GitLabClient.prototype.createPullRequest).toBeCalledTimes(0);
  });

  test("without dry run", async () => {
    addProcessArgs([
      "-tb",
      "target",
      "-pr",
      "https://my.gitlab.host.com/superuser/backporting-example/-/merge_requests/2"
    ]);
    
    await runner.execute();

    const cwd = process.cwd() + "/bp";

    expect(GitClientFactory.getOrCreate).toBeCalledTimes(1);
    expect(GitClientFactory.getOrCreate).toBeCalledWith(GitClientType.GITLAB, undefined, "https://my.gitlab.host.com/api/v4");

    expect(GitCLIService.prototype.clone).toBeCalledTimes(1);
    expect(GitCLIService.prototype.clone).toBeCalledWith("https://my.gitlab.host.com/superuser/backporting-example.git", cwd, "target");

    expect(GitCLIService.prototype.createLocalBranch).toBeCalledTimes(1);
    expect(GitCLIService.prototype.createLocalBranch).toBeCalledWith(cwd, "bp-target-9e15674");
    
    expect(GitCLIService.prototype.fetch).toBeCalledTimes(1);
    expect(GitCLIService.prototype.fetch).toBeCalledWith(cwd, "merge-requests/2/head:pr/2");

    expect(GitCLIService.prototype.cherryPick).toBeCalledTimes(1);
    expect(GitCLIService.prototype.cherryPick).toBeCalledWith(cwd, "9e15674ebd48e05c6e428a1fa31dbb60a778d644", undefined, undefined);

    expect(GitCLIService.prototype.push).toBeCalledTimes(1);
    expect(GitCLIService.prototype.push).toBeCalledWith(cwd, "bp-target-9e15674");

    expect(GitLabClient.prototype.createPullRequest).toBeCalledTimes(1);
    expect(GitLabClient.prototype.createPullRequest).toBeCalledWith({
        owner: "superuser", 
        repo: "backporting-example", 
        head: "bp-target-9e15674", 
        base: "target", 
        title: "[target] Update test.txt opened", 
        body: expect.stringContaining("**Backport:** https://my.gitlab.host.com/superuser/backporting-example/-/merge_requests/2"),
        reviewers: ["superuser"],
        assignees: [],
        labels: [],
        comments: [],
      }
    );
  });

  test("closed and not merged pull request", async () => {
    addProcessArgs([
      "-tb",
      "target",
      "-pr",
      "https://my.gitlab.host.com/superuser/backporting-example/-/merge_requests/3"
    ]);

    await expect(() => runner.execute()).rejects.toThrow("Provided pull request is closed and not merged");
  });

  test("merged pull request", async () => {
    addProcessArgs([
      "-tb",
      "target",
      "-pr",
      "https://my.gitlab.host.com/superuser/backporting-example/-/merge_requests/1"
    ]);

    await runner.execute();

    const cwd = process.cwd() + "/bp";

    expect(GitClientFactory.getOrCreate).toBeCalledTimes(1);
    expect(GitClientFactory.getOrCreate).toBeCalledWith(GitClientType.GITLAB, undefined, "https://my.gitlab.host.com/api/v4");

    expect(GitCLIService.prototype.clone).toBeCalledTimes(1);
    expect(GitCLIService.prototype.clone).toBeCalledWith("https://my.gitlab.host.com/superuser/backporting-example.git", cwd, "target");

    expect(GitCLIService.prototype.createLocalBranch).toBeCalledTimes(1);
    expect(GitCLIService.prototype.createLocalBranch).toBeCalledWith(cwd, "bp-target-ebb1eca");
    
    // 0 occurrences as the mr is already merged and the owner is the same for
    // both source and target repositories
    expect(GitCLIService.prototype.fetch).toBeCalledTimes(0);

    expect(GitCLIService.prototype.cherryPick).toBeCalledTimes(1);
    expect(GitCLIService.prototype.cherryPick).toBeCalledWith(cwd, "ebb1eca696c42fd067658bd9b5267709f78ef38e", undefined, undefined);

    expect(GitCLIService.prototype.push).toBeCalledTimes(1);
    expect(GitCLIService.prototype.push).toBeCalledWith(cwd, "bp-target-ebb1eca");

    expect(GitLabClient.prototype.createPullRequest).toBeCalledTimes(1);
    expect(GitLabClient.prototype.createPullRequest).toBeCalledWith({
        owner: "superuser", 
        repo: "backporting-example", 
        head: "bp-target-ebb1eca", 
        base: "target", 
        title: "[target] Update test.txt", 
        body: expect.stringContaining("**Backport:** https://my.gitlab.host.com/superuser/backporting-example/-/merge_requests/1"),
        reviewers: ["superuser"],
        assignees: [],
        labels: [],
        comments: [],
      }
    );
  });


  test("override backporting pr data", async () => {
    addProcessArgs([
      "-tb",
      "target",
      "-pr",
      "https://my.gitlab.host.com/superuser/backporting-example/-/merge_requests/2",
      "--title",
      "New Title",
      "--body",
      "New Body",
      "--body-prefix",
      "New Body Prefix - ",
      "--bp-branch-name",
      "bp_branch_name",
      "--reviewers",
      "user1,user2",
      "--assignees",
      "user3,user4"
    ]);
    
    await runner.execute();

    const cwd = process.cwd() + "/bp";

    expect(GitClientFactory.getOrCreate).toBeCalledTimes(1);
    expect(GitClientFactory.getOrCreate).toBeCalledWith(GitClientType.GITLAB, undefined, "https://my.gitlab.host.com/api/v4");

    expect(GitCLIService.prototype.clone).toBeCalledTimes(1);
    expect(GitCLIService.prototype.clone).toBeCalledWith("https://my.gitlab.host.com/superuser/backporting-example.git", cwd, "target");

    expect(GitCLIService.prototype.createLocalBranch).toBeCalledTimes(1);
    expect(GitCLIService.prototype.createLocalBranch).toBeCalledWith(cwd, "bp_branch_name");
    
    expect(GitCLIService.prototype.fetch).toBeCalledTimes(1);
    expect(GitCLIService.prototype.fetch).toBeCalledWith(cwd, "merge-requests/2/head:pr/2");

    expect(GitCLIService.prototype.cherryPick).toBeCalledTimes(1);
    expect(GitCLIService.prototype.cherryPick).toBeCalledWith(cwd, "9e15674ebd48e05c6e428a1fa31dbb60a778d644", undefined, undefined);

    expect(GitCLIService.prototype.push).toBeCalledTimes(1);
    expect(GitCLIService.prototype.push).toBeCalledWith(cwd, "bp_branch_name");

    expect(GitLabClient.prototype.createPullRequest).toBeCalledTimes(1);
    expect(GitLabClient.prototype.createPullRequest).toBeCalledWith({
        owner: "superuser", 
        repo: "backporting-example", 
        head: "bp_branch_name", 
        base: "target", 
        title: "New Title", 
        body: "New Body Prefix - New Body",
        reviewers: ["user1", "user2"],
        assignees: ["user3", "user4"],
        labels: [],
        comments: [],
      }
    );
  });

  test("set empty reviewers", async () => {
    addProcessArgs([
      "-tb",
      "target",
      "-pr",
      "https://my.gitlab.host.com/superuser/backporting-example/-/merge_requests/2",
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

    expect(GitClientFactory.getOrCreate).toBeCalledTimes(1);
    expect(GitClientFactory.getOrCreate).toBeCalledWith(GitClientType.GITLAB, undefined, "https://my.gitlab.host.com/api/v4");

    expect(GitCLIService.prototype.clone).toBeCalledTimes(1);
    expect(GitCLIService.prototype.clone).toBeCalledWith("https://my.gitlab.host.com/superuser/backporting-example.git", cwd, "target");

    expect(GitCLIService.prototype.createLocalBranch).toBeCalledTimes(1);
    expect(GitCLIService.prototype.createLocalBranch).toBeCalledWith(cwd, "bp_branch_name");
    
    expect(GitCLIService.prototype.fetch).toBeCalledTimes(1);
    expect(GitCLIService.prototype.fetch).toBeCalledWith(cwd, "merge-requests/2/head:pr/2");

    expect(GitCLIService.prototype.cherryPick).toBeCalledTimes(1);
    expect(GitCLIService.prototype.cherryPick).toBeCalledWith(cwd, "9e15674ebd48e05c6e428a1fa31dbb60a778d644", undefined, undefined);

    expect(GitCLIService.prototype.push).toBeCalledTimes(1);
    expect(GitCLIService.prototype.push).toBeCalledWith(cwd, "bp_branch_name");

    expect(GitLabClient.prototype.createPullRequest).toBeCalledTimes(1);
    expect(GitLabClient.prototype.createPullRequest).toBeCalledWith({
        owner: "superuser", 
        repo: "backporting-example", 
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
    addProcessArgs([
      "-tb",
      "target",
      "-pr",
      "https://my.gitlab.host.com/superuser/backporting-example/-/merge_requests/1",
      "--labels",
      "cherry-pick :cherries:, another-label",
      "--inherit-labels",
    ]);
    
    await runner.execute();

    const cwd = process.cwd() + "/bp";

    expect(GitClientFactory.getOrCreate).toBeCalledTimes(1);
    expect(GitClientFactory.getOrCreate).toBeCalledWith(GitClientType.GITLAB, undefined, "https://my.gitlab.host.com/api/v4");

    expect(GitCLIService.prototype.clone).toBeCalledTimes(1);
    expect(GitCLIService.prototype.clone).toBeCalledWith("https://my.gitlab.host.com/superuser/backporting-example.git", cwd, "target");

    expect(GitCLIService.prototype.createLocalBranch).toBeCalledTimes(1);
    expect(GitCLIService.prototype.createLocalBranch).toBeCalledWith(cwd, "bp-target-ebb1eca");
    
    // 0 occurrences as the mr is already merged and the owner is the same for
    // both source and target repositories
    expect(GitCLIService.prototype.fetch).toBeCalledTimes(0);

    expect(GitCLIService.prototype.cherryPick).toBeCalledTimes(1);
    expect(GitCLIService.prototype.cherryPick).toBeCalledWith(cwd, "ebb1eca696c42fd067658bd9b5267709f78ef38e", undefined, undefined);

    expect(GitCLIService.prototype.push).toBeCalledTimes(1);
    expect(GitCLIService.prototype.push).toBeCalledWith(cwd, "bp-target-ebb1eca");

    expect(GitLabClient.prototype.createPullRequest).toBeCalledTimes(1);
    expect(GitLabClient.prototype.createPullRequest).toBeCalledWith({
        owner: "superuser", 
        repo: "backporting-example", 
        head: "bp-target-ebb1eca", 
        base: "target", 
        title: "[target] Update test.txt", 
        body: expect.stringContaining("**Backport:** https://my.gitlab.host.com/superuser/backporting-example/-/merge_requests/1"),
        reviewers: ["superuser"],
        assignees: [],
        labels: ["cherry-pick :cherries:", "another-label", "backport-prod"],
        comments: [],
      }
    );
  });

  test("set custom labels without inheritance", async () => {
    addProcessArgs([
      "-tb",
      "target",
      "-pr",
      "https://my.gitlab.host.com/superuser/backporting-example/-/merge_requests/1",
      "--labels",
      "cherry-pick :cherries:, another-label",
    ]);
    
    await runner.execute();

    const cwd = process.cwd() + "/bp";

    expect(GitClientFactory.getOrCreate).toBeCalledTimes(1);
    expect(GitClientFactory.getOrCreate).toBeCalledWith(GitClientType.GITLAB, undefined, "https://my.gitlab.host.com/api/v4");

    expect(GitCLIService.prototype.clone).toBeCalledTimes(1);
    expect(GitCLIService.prototype.clone).toBeCalledWith("https://my.gitlab.host.com/superuser/backporting-example.git", cwd, "target");

    expect(GitCLIService.prototype.createLocalBranch).toBeCalledTimes(1);
    expect(GitCLIService.prototype.createLocalBranch).toBeCalledWith(cwd, "bp-target-ebb1eca");
    
    // 0 occurrences as the mr is already merged and the owner is the same for
    // both source and target repositories
    expect(GitCLIService.prototype.fetch).toBeCalledTimes(0);

    expect(GitCLIService.prototype.cherryPick).toBeCalledTimes(1);
    expect(GitCLIService.prototype.cherryPick).toBeCalledWith(cwd, "ebb1eca696c42fd067658bd9b5267709f78ef38e", undefined, undefined);

    expect(GitCLIService.prototype.push).toBeCalledTimes(1);
    expect(GitCLIService.prototype.push).toBeCalledWith(cwd, "bp-target-ebb1eca");

    expect(GitLabClient.prototype.createPullRequest).toBeCalledTimes(1);
    expect(GitLabClient.prototype.createPullRequest).toBeCalledWith({
        owner: "superuser", 
        repo: "backporting-example", 
        head: "bp-target-ebb1eca", 
        base: "target", 
        title: "[target] Update test.txt", 
        body: expect.stringContaining("**Backport:** https://my.gitlab.host.com/superuser/backporting-example/-/merge_requests/1"),
        reviewers: ["superuser"],
        assignees: [],
        labels: ["cherry-pick :cherries:", "another-label"],
        comments: [],
      }
    );
  });

  test("using config file with overrides", async () => {
    addProcessArgs([
      "--config-file",
      GITLAB_MERGED_PR_COMPLEX_CONFIG_FILE_CONTENT_PATHNAME,
    ]);
    
    await runner.execute();

    const cwd = process.cwd() + "/bp";

    expect(GitClientFactory.getOrCreate).toBeCalledTimes(1);
    expect(GitClientFactory.getOrCreate).toBeCalledWith(GitClientType.GITLAB, "my-token", "https://my.gitlab.host.com/api/v4");

    expect(GitCLIService.prototype.clone).toBeCalledTimes(1);
    expect(GitCLIService.prototype.clone).toBeCalledWith("https://my.gitlab.host.com/superuser/backporting-example.git", cwd, "prod");

    expect(GitCLIService.prototype.createLocalBranch).toBeCalledTimes(1);
    expect(GitCLIService.prototype.createLocalBranch).toBeCalledWith(cwd, "bp-prod-ebb1eca");
    
    // 0 occurrences as the mr is already merged and the owner is the same for
    // both source and target repositories
    expect(GitCLIService.prototype.fetch).toBeCalledTimes(0);

    expect(GitCLIService.prototype.cherryPick).toBeCalledTimes(1);
    expect(GitCLIService.prototype.cherryPick).toBeCalledWith(cwd, "ebb1eca696c42fd067658bd9b5267709f78ef38e", undefined, undefined);

    expect(GitCLIService.prototype.push).toBeCalledTimes(1);
    expect(GitCLIService.prototype.push).toBeCalledWith(cwd, "bp-prod-ebb1eca");

    expect(GitLabClient.prototype.createPullRequest).toBeCalledTimes(1);
    expect(GitLabClient.prototype.createPullRequest).toBeCalledWith({
        owner: "superuser", 
        repo: "backporting-example", 
        head: "bp-prod-ebb1eca", 
        base: "prod", 
        title: "New Title", 
        body: expect.stringContaining("**This is a backport:** https://my.gitlab.host.com/superuser/backporting-example/-/merge_requests/1"),
        reviewers: [],
        assignees: ["user3", "user4"],
        labels: ["cli gitlab cherry pick :cherries:", "backport-prod"],
        comments: [],
      }
    );
  });

  test("single commit without squash", async () => {
    addProcessArgs([
      "-tb",
      "target",
      "-pr",
      "https://my.gitlab.host.com/superuser/backporting-example/-/merge_requests/1",
      "--no-squash",
    ]);

    await runner.execute();

    const cwd = process.cwd() + "/bp";

    expect(GitClientFactory.getOrCreate).toBeCalledTimes(1);
    expect(GitClientFactory.getOrCreate).toBeCalledWith(GitClientType.GITLAB, undefined, "https://my.gitlab.host.com/api/v4");

    expect(GitCLIService.prototype.clone).toBeCalledTimes(1);
    expect(GitCLIService.prototype.clone).toBeCalledWith("https://my.gitlab.host.com/superuser/backporting-example.git", cwd, "target");

    expect(GitCLIService.prototype.createLocalBranch).toBeCalledTimes(1);
    expect(GitCLIService.prototype.createLocalBranch).toBeCalledWith(cwd, "bp-target-e4dd336");

    expect(GitCLIService.prototype.cherryPick).toBeCalledTimes(1);
    expect(GitCLIService.prototype.cherryPick).toBeCalledWith(cwd, "e4dd336a4a20f394df6665994df382fb1d193a11", undefined, undefined);

    expect(GitCLIService.prototype.push).toBeCalledTimes(1);
    expect(GitCLIService.prototype.push).toBeCalledWith(cwd, "bp-target-e4dd336");

    expect(GitLabClient.prototype.createPullRequest).toBeCalledTimes(1);
    expect(GitLabClient.prototype.createPullRequest).toBeCalledWith({
        owner: "superuser", 
        repo: "backporting-example", 
        head: "bp-target-e4dd336",
        base: "target", 
        title: "[target] Update test.txt", 
        body: expect.stringContaining("**Backport:** https://my.gitlab.host.com/superuser/backporting-example/-/merge_requests/1"),
        reviewers: ["superuser"],
        assignees: [],
        labels: [],
        comments: [],
      }
    );
  });

  test("multiple commits without squash", async () => {
    addProcessArgs([
      "-tb",
      "target",
      "-pr",
      "https://my.gitlab.host.com/superuser/backporting-example/-/merge_requests/2",
      "--no-squash",
    ]);

    await runner.execute();

    const cwd = process.cwd() + "/bp";

    expect(GitClientFactory.getOrCreate).toBeCalledTimes(1);
    expect(GitClientFactory.getOrCreate).toBeCalledWith(GitClientType.GITLAB, undefined, "https://my.gitlab.host.com/api/v4");

    expect(GitCLIService.prototype.clone).toBeCalledTimes(1);
    expect(GitCLIService.prototype.clone).toBeCalledWith("https://my.gitlab.host.com/superuser/backporting-example.git", cwd, "target");

    expect(GitCLIService.prototype.createLocalBranch).toBeCalledTimes(1);
    expect(GitCLIService.prototype.createLocalBranch).toBeCalledWith(cwd, "bp-target-e4dd336-974519f");
    
    expect(GitCLIService.prototype.fetch).toBeCalledTimes(1);
    expect(GitCLIService.prototype.fetch).toBeCalledWith(cwd, "merge-requests/2/head:pr/2");

    expect(GitCLIService.prototype.cherryPick).toBeCalledTimes(2);
    expect(GitCLIService.prototype.cherryPick).toBeCalledWith(cwd, "e4dd336a4a20f394df6665994df382fb1d193a11", undefined, undefined);
    expect(GitCLIService.prototype.cherryPick).toBeCalledWith(cwd, "974519f65c9e0ed65277cd71026657a09fca05e7", undefined, undefined);

    expect(GitCLIService.prototype.push).toBeCalledTimes(1);
    expect(GitCLIService.prototype.push).toBeCalledWith(cwd, "bp-target-e4dd336-974519f");

    expect(GitLabClient.prototype.createPullRequest).toBeCalledTimes(1);
    expect(GitLabClient.prototype.createPullRequest).toBeCalledWith({
        owner: "superuser", 
        repo: "backporting-example", 
        head: "bp-target-e4dd336-974519f",
        base: "target", 
        title: "[target] Update test.txt opened", 
        body: expect.stringContaining("**Backport:** https://my.gitlab.host.com/superuser/backporting-example/-/merge_requests/2"),
        reviewers: ["superuser"],
        assignees: [],
        labels: [],
        comments: [],
      }
    );
  });

  test("auth using GITLAB_TOKEN takes precedence over GIT_TOKEN env variable", async () => {
    process.env[AuthTokenId.GIT_TOKEN] = "mygittoken";
    process.env[AuthTokenId.GITLAB_TOKEN] = "mygitlabtoken";
    addProcessArgs([
      "-tb",
      "target",
      "-pr",
      "https://my.gitlab.host.com/superuser/backporting-example/-/merge_requests/2"
    ]);
    
    await runner.execute();

    expect(GitClientFactory.getOrCreate).toBeCalledTimes(1);
    expect(GitClientFactory.getOrCreate).toBeCalledWith(GitClientType.GITLAB, "mygitlabtoken", "https://my.gitlab.host.com/api/v4");
  
    // Not interested in all subsequent calls, already tested in other test cases
  });

  test("auth arg takes precedence over GITLAB_TOKEN", async () => {
    process.env[AuthTokenId.GITLAB_TOKEN] = "mygitlabtoken";
    addProcessArgs([
      "-tb",
      "target",
      "-pr",
      "https://my.gitlab.host.com/superuser/backporting-example/-/merge_requests/2",
      "-a",
      "mytoken"
    ]);
    
    await runner.execute();

    expect(GitClientFactory.getOrCreate).toBeCalledTimes(1);
    expect(GitClientFactory.getOrCreate).toBeCalledWith(GitClientType.GITLAB, "mytoken", "https://my.gitlab.host.com/api/v4");
  
    // Not interested in all subsequent calls, already tested in other test cases
  });

  test("ignore env variables related to other git platforms", async () => {
    process.env[AuthTokenId.GITHUB_TOKEN] = "mygithubtoken";
    process.env[AuthTokenId.CODEBERG_TOKEN] = "mycodebergtoken";
    addProcessArgs([
      "-tb",
      "target",
      "-pr",
      "https://my.gitlab.host.com/superuser/backporting-example/-/merge_requests/2"
    ]);
    
    await runner.execute();

    expect(GitClientFactory.getOrCreate).toBeCalledTimes(1);
    expect(GitClientFactory.getOrCreate).toBeCalledWith(GitClientType.GITLAB, undefined, "https://my.gitlab.host.com/api/v4");
  
    // Not interested in all subsequent calls, already tested in other test cases
  });
});