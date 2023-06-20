import { Args } from "@bp/service/args/args.types";
import CLIArgsParser from "@bp/service/args/cli/cli-args-parser";
import { addProcessArgs, resetProcessArgs } from "../../../support/utils";

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
    expect(args.author).toEqual(undefined);
    expect(args.folder).toEqual(undefined);
    expect(args.targetBranch).toEqual("target");
    expect(args.pullRequest).toEqual("https://localhost/whatever/pulls/1");
    expect(args.title).toEqual(undefined);
    expect(args.body).toEqual(undefined);
    expect(args.bodyPrefix).toEqual(undefined);
    expect(args.bpBranchName).toEqual(undefined);
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
    expect(args.author).toEqual(undefined);
    expect(args.folder).toEqual(undefined);
    expect(args.targetBranch).toEqual("target");
    expect(args.pullRequest).toEqual("https://localhost/whatever/pulls/1");
    expect(args.title).toEqual(undefined);
    expect(args.body).toEqual(undefined);
    expect(args.bodyPrefix).toEqual(undefined);
    expect(args.bpBranchName).toEqual(undefined);
  });

  test("valid execution [override, short]", () => {
    addProcessArgs([
      "-d",
      "-a",
      "bearer-token",
      "-tb",
      "target",
      "-pr",
      "https://localhost/whatever/pulls/1"
    ]);

    const args: Args = parser.parse();
    expect(args.dryRun).toEqual(true);
    expect(args.auth).toEqual("bearer-token");
    expect(args.author).toEqual(undefined);
    expect(args.folder).toEqual(undefined);
    expect(args.targetBranch).toEqual("target");
    expect(args.pullRequest).toEqual("https://localhost/whatever/pulls/1");
    expect(args.title).toEqual(undefined);
    expect(args.body).toEqual(undefined);
    expect(args.bodyPrefix).toEqual(undefined);
    expect(args.bpBranchName).toEqual(undefined);
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
      "--title",
      "New Title",
      "--body",
      "New Body",
      "--body-prefix",
      "New Body Prefix",
      "--bp-branch-name",
      "bp_branch_name",
    ]);

    const args: Args = parser.parse();
    expect(args.dryRun).toEqual(true);
    expect(args.auth).toEqual("bearer-token");
    expect(args.author).toEqual(undefined);
    expect(args.folder).toEqual(undefined);
    expect(args.targetBranch).toEqual("target");
    expect(args.pullRequest).toEqual("https://localhost/whatever/pulls/1");
    expect(args.title).toEqual("New Title");
    expect(args.body).toEqual("New Body");
    expect(args.bodyPrefix).toEqual("New Body Prefix");
    expect(args.bpBranchName).toEqual("bp_branch_name");
  });

});