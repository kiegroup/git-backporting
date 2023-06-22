import { Args } from "@bp/service/args/args.types";
import GHAArgsParser from "@bp/service/args/gha/gha-args-parser";
import { spyGetInput } from "../../../support/utils";

describe("gha args parser", () => {
  let parser: GHAArgsParser;

  beforeEach(() => {
    // create a fresh new instance every time
    parser = new GHAArgsParser();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("getOrDefault", () => {
    spyGetInput({
      "present": "value"
    });
    expect(parser.getOrDefault("not-present", "default")).toStrictEqual("default");
    expect(parser.getOrDefault("present", "default")).toStrictEqual("value");
  });

  test("getOrUndefined", () => {
    spyGetInput({
      "present": "value",
      "empty": ""
    });
    expect(parser.getOrUndefined("empty")).toStrictEqual(undefined);
    expect(parser.getOrUndefined("present")).toStrictEqual("value");
  });

  test("valid execution [default]", () => {
    spyGetInput({
      "target-branch": "target",
      "pull-request": "https://localhost/whatever/pulls/1"
    });

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
  });

  test("valid execution [override]", () => {
    spyGetInput({
      "dry-run": "true",
      "auth": "bearer-token",
      "target-branch": "target",
      "pull-request": "https://localhost/whatever/pulls/1",
      "git-user": "Me",
      "git-email": "me@email.com",
      "title": "New Title",
      "body": "New Body",
      "body-prefix": "New Body Prefix",
      "bp-branch-name": "bp_branch_name",
    });

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
  });

});