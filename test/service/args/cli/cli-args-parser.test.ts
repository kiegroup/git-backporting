import { Args } from "@bp/service/args/args.types";
import CLIArgsParser from "@bp/service/args/cli/cli-args-parser";
import { addProcessArgs, resetProcessArgs, expectArrayEqual, createTestFile, removeTestFile } from "../../../support/utils";

export const SIMPLE_CONFIG_FILE_CONTENT_PATHNAME = "./cli-args-parser-test-simple-config-file-pulls-1.json";
export const SIMPLE_CONFIG_FILE_CONTENT = {
  "targetBranch": "target",
  "pullRequest": "https://localhost/whatever/pulls/1",
};

const RANDOM_CONFIG_FILE_CONTENT_PATHNAME = "./cli-args-parser-test-random-config-file.json";
const RANDOM_CONFIG_FILE_CONTENT = {
  "dryRun": true,
  "auth": "your-git-service-auth-token",
  "targetBranch": "target-branch-name",
  "pullRequest": "https://github.com/user/repo/pull/123",
  "folder": "/path/to/local/folder",
  "gitUser": "YourGitUser",
  "gitEmail": "your-email@example.com",
  "title": "Backport: Original PR Title",
  "body": "Backport: Original PR Body",
  "bodyPrefix": "backport <original-pr-link>",
  "bpBranchName": "backport-branch-name",
  "reviewers": ["reviewer1", "reviewer2"],
  "assignees": ["assignee1", "assignee2"],
  "inheritReviewers": true,
};

describe("cli args parser", () => {
  let parser: CLIArgsParser;
  
  beforeAll(() => {
    // create a temporary file
    createTestFile(SIMPLE_CONFIG_FILE_CONTENT_PATHNAME, JSON.stringify(SIMPLE_CONFIG_FILE_CONTENT));
    createTestFile(RANDOM_CONFIG_FILE_CONTENT_PATHNAME, JSON.stringify(RANDOM_CONFIG_FILE_CONTENT));
  });

  afterAll(() => {
    // clean up all temporary files
    removeTestFile(SIMPLE_CONFIG_FILE_CONTENT_PATHNAME);
    removeTestFile(RANDOM_CONFIG_FILE_CONTENT_PATHNAME);
  });

  beforeEach(() => {
    // create a fresh new instance every time
    parser = new CLIArgsParser();

    // reset process.env variables
    resetProcessArgs();
  });

  test("valid execution [default, short]", () => {
    addProcessArgs([
      "-tb",
      "target",
      "-pr",
      "https://localhost/whatever/pulls/1"
    ]);

    const args: Args = parser.parse();
    expect(args.dryRun).toEqual(false);
    expect(args.auth).toEqual(undefined);
    expect(args.gitUser).toEqual(undefined);
    expect(args.gitEmail).toEqual(undefined);
    expect(args.folder).toEqual(undefined);
    expect(args.targetBranch).toEqual("target");
    expect(args.pullRequest).toEqual("https://localhost/whatever/pulls/1");
    expect(args.title).toEqual(undefined);
    expect(args.body).toEqual(undefined);
    expect(args.bodyPrefix).toEqual(undefined);
    expect(args.bpBranchName).toEqual(undefined);
    expect(args.reviewers).toEqual([]);
    expect(args.assignees).toEqual([]);
    expect(args.inheritReviewers).toEqual(true);
  });

  test("with config file [default, short]", () => {
    addProcessArgs([
      "-cf",
      SIMPLE_CONFIG_FILE_CONTENT_PATHNAME,
    ]);

    const args: Args = parser.parse();
    expect(args.dryRun).toEqual(false);
    expect(args.auth).toEqual(undefined);
    expect(args.gitUser).toEqual(undefined);
    expect(args.gitEmail).toEqual(undefined);
    expect(args.folder).toEqual(undefined);
    expect(args.targetBranch).toEqual("target");
    expect(args.pullRequest).toEqual("https://localhost/whatever/pulls/1");
    expect(args.title).toEqual(undefined);
    expect(args.body).toEqual(undefined);
    expect(args.bodyPrefix).toEqual(undefined);
    expect(args.bpBranchName).toEqual(undefined);
    expect(args.reviewers).toEqual([]);
    expect(args.assignees).toEqual([]);
    expect(args.inheritReviewers).toEqual(true);
  });

  test("valid execution [default, long]", () => {
    addProcessArgs([
      "--target-branch",
      "target",
      "--pull-request",
      "https://localhost/whatever/pulls/1"
    ]);

    const args: Args = parser.parse();
    expect(args.dryRun).toEqual(false);
    expect(args.auth).toEqual(undefined);
    expect(args.gitUser).toEqual(undefined);
    expect(args.gitEmail).toEqual(undefined);
    expect(args.folder).toEqual(undefined);
    expect(args.targetBranch).toEqual("target");
    expect(args.pullRequest).toEqual("https://localhost/whatever/pulls/1");
    expect(args.title).toEqual(undefined);
    expect(args.body).toEqual(undefined);
    expect(args.bodyPrefix).toEqual(undefined);
    expect(args.bpBranchName).toEqual(undefined);
    expect(args.reviewers).toEqual([]);
    expect(args.assignees).toEqual([]);
    expect(args.inheritReviewers).toEqual(true);
  });

  test("with config file [default, long]", () => {
    addProcessArgs([
      "--config-file",
      SIMPLE_CONFIG_FILE_CONTENT_PATHNAME,
    ]);

    const args: Args = parser.parse();
    expect(args.dryRun).toEqual(false);
    expect(args.auth).toEqual(undefined);
    expect(args.gitUser).toEqual(undefined);
    expect(args.gitEmail).toEqual(undefined);
    expect(args.folder).toEqual(undefined);
    expect(args.targetBranch).toEqual("target");
    expect(args.pullRequest).toEqual("https://localhost/whatever/pulls/1");
    expect(args.title).toEqual(undefined);
    expect(args.body).toEqual(undefined);
    expect(args.bodyPrefix).toEqual(undefined);
    expect(args.bpBranchName).toEqual(undefined);
    expect(args.reviewers).toEqual([]);
    expect(args.assignees).toEqual([]);
    expect(args.inheritReviewers).toEqual(true);
  });

  test("valid execution [override, short]", () => {
    addProcessArgs([
      "-d",
      "-a",
      "bearer-token",
      "-tb",
      "target",
      "-pr",
      "https://localhost/whatever/pulls/1",
      "-gu",
      "Me",
      "-ge",
      "me@email.com",
    ]);

    const args: Args = parser.parse();
    expect(args.dryRun).toEqual(true);
    expect(args.auth).toEqual("bearer-token");
    expect(args.gitUser).toEqual("Me");
    expect(args.gitEmail).toEqual("me@email.com");
    expect(args.folder).toEqual(undefined);
    expect(args.targetBranch).toEqual("target");
    expect(args.pullRequest).toEqual("https://localhost/whatever/pulls/1");
    expect(args.title).toEqual(undefined);
    expect(args.body).toEqual(undefined);
    expect(args.bodyPrefix).toEqual(undefined);
    expect(args.bpBranchName).toEqual(undefined);
    expect(args.reviewers).toEqual([]);
    expect(args.assignees).toEqual([]);
    expect(args.inheritReviewers).toEqual(true);
  });

  test("valid execution [override, long]", () => {
    addProcessArgs([
      "--dry-run",
      "--auth",
      "bearer-token",
      "--target-branch",
      "target",
      "--pull-request",
      "https://localhost/whatever/pulls/1",
      "--git-user",
      "Me",
      "--git-email",
      "me@email.com",
      "--title",
      "New Title",
      "--body",
      "New Body",
      "--body-prefix",
      "New Body Prefix",
      "--bp-branch-name",
      "bp_branch_name",
      "--reviewers",
      "al , john,  jack",
      "--assignees",
      " pippo,pluto, paperino",
      "--no-inherit-reviewers",
    ]);

    const args: Args = parser.parse();
    expect(args.dryRun).toEqual(true);
    expect(args.auth).toEqual("bearer-token");
    expect(args.gitUser).toEqual("Me");
    expect(args.gitEmail).toEqual("me@email.com");
    expect(args.folder).toEqual(undefined);
    expect(args.targetBranch).toEqual("target");
    expect(args.pullRequest).toEqual("https://localhost/whatever/pulls/1");
    expect(args.title).toEqual("New Title");
    expect(args.body).toEqual("New Body");
    expect(args.bodyPrefix).toEqual("New Body Prefix");
    expect(args.bpBranchName).toEqual("bp_branch_name");
    expectArrayEqual(args.reviewers!, ["al", "john", "jack"]);
    expectArrayEqual(args.assignees!, ["pippo", "pluto", "paperino"]);
    expect(args.inheritReviewers).toEqual(false);
  });

  test("override using config file", () => {
    addProcessArgs([
      "--config-file",
      RANDOM_CONFIG_FILE_CONTENT_PATHNAME,
    ]);

    const args: Args = parser.parse();
    expect(args.dryRun).toEqual(true);
    expect(args.auth).toEqual("your-git-service-auth-token");
    expect(args.gitUser).toEqual("YourGitUser");
    expect(args.gitEmail).toEqual("your-email@example.com");
    expect(args.folder).toEqual("/path/to/local/folder");
    expect(args.targetBranch).toEqual("target-branch-name");
    expect(args.pullRequest).toEqual("https://github.com/user/repo/pull/123");
    expect(args.title).toEqual("Backport: Original PR Title");
    expect(args.body).toEqual("Backport: Original PR Body");
    expect(args.bodyPrefix).toEqual("backport <original-pr-link>");
    expect(args.bpBranchName).toEqual("backport-branch-name");
    expectArrayEqual(args.reviewers!, ["reviewer1", "reviewer2"]);
    expectArrayEqual(args.assignees!,["assignee1", "assignee2"]);
    expect(args.inheritReviewers).toEqual(true);
  });

  test("ignore custom option when config file is set", () => {
    addProcessArgs([
      "--config-file",
      RANDOM_CONFIG_FILE_CONTENT_PATHNAME,
      "--dry-run",
      "--auth",
      "bearer-token",
      "--target-branch",
      "target",
      "--pull-request",
      "https://localhost/whatever/pulls/1",
      "--git-user",
      "Me",
      "--git-email",
      "me@email.com",
      "--title",
      "New Title",
      "--body",
      "New Body",
      "--body-prefix",
      "New Body Prefix",
      "--bp-branch-name",
      "bp_branch_name",
      "--reviewers",
      "al , john,  jack",
      "--assignees",
      " pippo,pluto, paperino",
      "--no-inherit-reviewers",
    ]);

    const args: Args = parser.parse();
    expect(args.dryRun).toEqual(true);
    expect(args.auth).toEqual("your-git-service-auth-token");
    expect(args.gitUser).toEqual("YourGitUser");
    expect(args.gitEmail).toEqual("your-email@example.com");
    expect(args.folder).toEqual("/path/to/local/folder");
    expect(args.targetBranch).toEqual("target-branch-name");
    expect(args.pullRequest).toEqual("https://github.com/user/repo/pull/123");
    expect(args.title).toEqual("Backport: Original PR Title");
    expect(args.body).toEqual("Backport: Original PR Body");
    expect(args.bodyPrefix).toEqual("backport <original-pr-link>");
    expect(args.bpBranchName).toEqual("backport-branch-name");
    expectArrayEqual(args.reviewers!, ["reviewer1", "reviewer2"]);
    expectArrayEqual(args.assignees!,["assignee1", "assignee2"]);
    expect(args.inheritReviewers).toEqual(true);
  });
});