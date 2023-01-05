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


  test("valid execution [default]", () => {
    spyGetInput({
      "target-branch": "target",
      "pull-request": "https://localhost/whatever/pulls/1"
    });

    const args: Args = parser.parse();
    expect(args.dryRun).toEqual(false);
    expect(args.auth).toEqual("");
    expect(args.author).toEqual(undefined);
    expect(args.folder).toEqual(undefined);
    expect(args.targetBranch).toEqual("target");
    expect(args.pullRequest).toEqual("https://localhost/whatever/pulls/1");
  });

  test("valid execution [override]", () => {
    spyGetInput({
      "dry-run": "true",
      "auth": "bearer-token",
      "target-branch": "target",
      "pull-request": "https://localhost/whatever/pulls/1"
    });

    const args: Args = parser.parse();
    expect(args.dryRun).toEqual(true);
    expect(args.auth).toEqual("bearer-token");
    expect(args.author).toEqual(undefined);
    expect(args.folder).toEqual(undefined);
    expect(args.targetBranch).toEqual("target");
    expect(args.pullRequest).toEqual("https://localhost/whatever/pulls/1");
  });

});