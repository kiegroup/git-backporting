import ArgsParser from "@bp/service/args/args-parser";
import Runner from "@bp/service/runner/runner";
import GitCLIService from "@bp/service/git/git-cli";
import GitLabClient from "@bp/service/git/gitlab/gitlab-client";
import CLIArgsParser from "@bp/service/args/cli/cli-args-parser";
import { addProcessArgs, createTestFile, removeTestFile, resetProcessArgs } from "../../support/utils";
import { getAxiosMocked } from "../../support/mock/git-client-mock-support";
import { MERGED_SQUASHED_MR } from "../../support/mock/gitlab-data";

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
      put: jest.fn(),
    }),
  };
});

jest.mock("@bp/service/git/git-cli");
jest.spyOn(GitLabClient.prototype, "createPullRequest");


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
  // create CLI arguments parser
  parser = new CLIArgsParser();

  // create runner
  runner = new Runner(parser);
});

afterEach(() => {
  jest.clearAllMocks();
  
  // reset process.env variables
  resetProcessArgs();
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

    expect(GitCLIService.prototype.clone).toBeCalledTimes(1);
    expect(GitCLIService.prototype.clone).toBeCalledWith("https://my.gitlab.host.com/superuser/backporting-example.git", cwd, "target");

    expect(GitCLIService.prototype.createLocalBranch).toBeCalledTimes(1);
    expect(GitCLIService.prototype.createLocalBranch).toBeCalledWith(cwd, "bp-target-9e15674ebd48e05c6e428a1fa31dbb60a778d644");
    
    expect(GitCLIService.prototype.fetch).toBeCalledTimes(1);
    expect(GitCLIService.prototype.fetch).toBeCalledWith(cwd, "merge-requests/2/head:pr/2");

    expect(GitCLIService.prototype.cherryPick).toBeCalledTimes(1);
    expect(GitCLIService.prototype.cherryPick).toBeCalledWith(cwd, "9e15674ebd48e05c6e428a1fa31dbb60a778d644");

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

    expect(GitCLIService.prototype.clone).toBeCalledTimes(1);
    expect(GitCLIService.prototype.clone).toBeCalledWith("https://my.gitlab.host.com/superuser/backporting-example.git", cwd, "target");

    expect(GitCLIService.prototype.createLocalBranch).toBeCalledTimes(1);
    expect(GitCLIService.prototype.createLocalBranch).toBeCalledWith(cwd, "bp-target-9e15674ebd48e05c6e428a1fa31dbb60a778d644");
    
    expect(GitCLIService.prototype.fetch).toBeCalledTimes(1);
    expect(GitCLIService.prototype.fetch).toBeCalledWith(cwd, "merge-requests/2/head:pr/2");

    expect(GitCLIService.prototype.cherryPick).toBeCalledTimes(1);
    expect(GitCLIService.prototype.cherryPick).toBeCalledWith(cwd, "9e15674ebd48e05c6e428a1fa31dbb60a778d644");

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

    expect(GitCLIService.prototype.clone).toBeCalledTimes(1);
    expect(GitCLIService.prototype.clone).toBeCalledWith("https://my.gitlab.host.com/superuser/backporting-example.git", cwd, "target");

    expect(GitCLIService.prototype.createLocalBranch).toBeCalledTimes(1);
    expect(GitCLIService.prototype.createLocalBranch).toBeCalledWith(cwd, "bp-target-9e15674ebd48e05c6e428a1fa31dbb60a778d644");
    
    expect(GitCLIService.prototype.fetch).toBeCalledTimes(1);
    expect(GitCLIService.prototype.fetch).toBeCalledWith(cwd, "merge-requests/2/head:pr/2");

    expect(GitCLIService.prototype.cherryPick).toBeCalledTimes(1);
    expect(GitCLIService.prototype.cherryPick).toBeCalledWith(cwd, "9e15674ebd48e05c6e428a1fa31dbb60a778d644");

    expect(GitCLIService.prototype.push).toBeCalledTimes(1);
    expect(GitCLIService.prototype.push).toBeCalledWith(cwd, "bp-target-9e15674ebd48e05c6e428a1fa31dbb60a778d644");

    expect(GitLabClient.prototype.createPullRequest).toBeCalledTimes(1);
    expect(GitLabClient.prototype.createPullRequest).toBeCalledWith({
        owner: "superuser", 
        repo: "backporting-example", 
        head: "bp-target-9e15674ebd48e05c6e428a1fa31dbb60a778d644", 
        base: "target", 
        title: "[target] Update test.txt opened", 
        body: expect.stringContaining("**Backport:** https://my.gitlab.host.com/superuser/backporting-example/-/merge_requests/2"),
        reviewers: ["superuser"],
        assignees: [],
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

    expect(async () => await runner.execute()).rejects.toThrow("Provided pull request is closed and not merged!");
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

    expect(GitCLIService.prototype.clone).toBeCalledTimes(1);
    expect(GitCLIService.prototype.clone).toBeCalledWith("https://my.gitlab.host.com/superuser/backporting-example.git", cwd, "target");

    expect(GitCLIService.prototype.createLocalBranch).toBeCalledTimes(1);
    expect(GitCLIService.prototype.createLocalBranch).toBeCalledWith(cwd, "bp-target-ebb1eca696c42fd067658bd9b5267709f78ef38e");
    
    // 0 occurrences as the mr is already merged and the owner is the same for
    // both source and target repositories
    expect(GitCLIService.prototype.fetch).toBeCalledTimes(0);

    expect(GitCLIService.prototype.cherryPick).toBeCalledTimes(1);
    expect(GitCLIService.prototype.cherryPick).toBeCalledWith(cwd, "ebb1eca696c42fd067658bd9b5267709f78ef38e");

    expect(GitCLIService.prototype.push).toBeCalledTimes(1);
    expect(GitCLIService.prototype.push).toBeCalledWith(cwd, "bp-target-ebb1eca696c42fd067658bd9b5267709f78ef38e");

    expect(GitLabClient.prototype.createPullRequest).toBeCalledTimes(1);
    expect(GitLabClient.prototype.createPullRequest).toBeCalledWith({
        owner: "superuser", 
        repo: "backporting-example", 
        head: "bp-target-ebb1eca696c42fd067658bd9b5267709f78ef38e", 
        base: "target", 
        title: "[target] Update test.txt", 
        body: expect.stringContaining("**Backport:** https://my.gitlab.host.com/superuser/backporting-example/-/merge_requests/1"),
        reviewers: ["superuser"],
        assignees: [],
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

    expect(GitCLIService.prototype.clone).toBeCalledTimes(1);
    expect(GitCLIService.prototype.clone).toBeCalledWith("https://my.gitlab.host.com/superuser/backporting-example.git", cwd, "target");

    expect(GitCLIService.prototype.createLocalBranch).toBeCalledTimes(1);
    expect(GitCLIService.prototype.createLocalBranch).toBeCalledWith(cwd, "bp_branch_name");
    
    expect(GitCLIService.prototype.fetch).toBeCalledTimes(1);
    expect(GitCLIService.prototype.fetch).toBeCalledWith(cwd, "merge-requests/2/head:pr/2");

    expect(GitCLIService.prototype.cherryPick).toBeCalledTimes(1);
    expect(GitCLIService.prototype.cherryPick).toBeCalledWith(cwd, "9e15674ebd48e05c6e428a1fa31dbb60a778d644");

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

    expect(GitCLIService.prototype.clone).toBeCalledTimes(1);
    expect(GitCLIService.prototype.clone).toBeCalledWith("https://my.gitlab.host.com/superuser/backporting-example.git", cwd, "target");

    expect(GitCLIService.prototype.createLocalBranch).toBeCalledTimes(1);
    expect(GitCLIService.prototype.createLocalBranch).toBeCalledWith(cwd, "bp_branch_name");
    
    expect(GitCLIService.prototype.fetch).toBeCalledTimes(1);
    expect(GitCLIService.prototype.fetch).toBeCalledWith(cwd, "merge-requests/2/head:pr/2");

    expect(GitCLIService.prototype.cherryPick).toBeCalledTimes(1);
    expect(GitCLIService.prototype.cherryPick).toBeCalledWith(cwd, "9e15674ebd48e05c6e428a1fa31dbb60a778d644");

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

    expect(GitCLIService.prototype.clone).toBeCalledTimes(1);
    expect(GitCLIService.prototype.clone).toBeCalledWith("https://my.gitlab.host.com/superuser/backporting-example.git", cwd, "prod");

    expect(GitCLIService.prototype.createLocalBranch).toBeCalledTimes(1);
    expect(GitCLIService.prototype.createLocalBranch).toBeCalledWith(cwd, "bp-prod-ebb1eca696c42fd067658bd9b5267709f78ef38e");
    
    // 0 occurrences as the mr is already merged and the owner is the same for
    // both source and target repositories
    expect(GitCLIService.prototype.fetch).toBeCalledTimes(0);

    expect(GitCLIService.prototype.cherryPick).toBeCalledTimes(1);
    expect(GitCLIService.prototype.cherryPick).toBeCalledWith(cwd, "ebb1eca696c42fd067658bd9b5267709f78ef38e");

    expect(GitCLIService.prototype.push).toBeCalledTimes(1);
    expect(GitCLIService.prototype.push).toBeCalledWith(cwd, "bp-prod-ebb1eca696c42fd067658bd9b5267709f78ef38e");

    expect(GitLabClient.prototype.createPullRequest).toBeCalledTimes(1);
    expect(GitLabClient.prototype.createPullRequest).toBeCalledWith({
        owner: "superuser", 
        repo: "backporting-example", 
        head: "bp-prod-ebb1eca696c42fd067658bd9b5267709f78ef38e", 
        base: "prod", 
        title: "New Title", 
        body: expect.stringContaining("**This is a backport:** https://my.gitlab.host.com/superuser/backporting-example/-/merge_requests/1"),
        reviewers: [],
        assignees: ["user3", "user4"],
      }
    );
  });
});