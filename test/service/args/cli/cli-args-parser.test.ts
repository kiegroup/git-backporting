import { Args } from "@bp/service/args/args.types";
import CLIArgsParser from "@bp/service/args/cli/cli-args-parser";
import { addProcessArgs, resetProcessArgs, expectArrayEqual } from "../../../support/utils";

describe("cli args parser", () => {
  let parser: CLIArgsParser;

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
    expect(args.auth).toEqual("");
    expect(args.gitUser).toEqual("GitHub");
    expect(args.gitEmail).toEqual("noreply@github.com");
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
    expect(args.auth).toEqual("");
    expect(args.gitUser).toEqual("GitHub");
    expect(args.gitEmail).toEqual("noreply@github.com");
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
    expectArrayEqual(["al", "john", "jack"], args.reviewers!);
    expectArrayEqual(["pippo", "pluto", "paperino"], args.assignees!);
    expect(args.inheritReviewers).toEqual(false);
  });

});