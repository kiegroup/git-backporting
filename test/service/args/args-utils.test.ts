import { getAsCleanedCommaSeparatedList, getAsCommaSeparatedList, getOrUndefined, parseArgs, readConfigFile } from "@bp/service/args/args-utils";
import { createTestFile, expectArrayEqual, removeTestFile, spyGetInput } from "../../support/utils";
import { getInput } from "@actions/core";

const RANDOM_CONFIG_FILE_CONTENT_PATHNAME = "./args-utils-test-random-config-file.json";
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


describe("args utils test suite", () => {
  beforeAll(() => {
    // create a temporary file
    createTestFile(RANDOM_CONFIG_FILE_CONTENT_PATHNAME, JSON.stringify(RANDOM_CONFIG_FILE_CONTENT));
  });

  afterAll(() => {
    // clean up all temporary files
    removeTestFile(RANDOM_CONFIG_FILE_CONTENT_PATHNAME);
  });

  test("check parseArgs function", () => {
    const asString = JSON.stringify(RANDOM_CONFIG_FILE_CONTENT);
    expect(parseArgs(asString)).toStrictEqual(RANDOM_CONFIG_FILE_CONTENT);
  });

  test("check readConfigFile function", () => {
    expect(readConfigFile(RANDOM_CONFIG_FILE_CONTENT_PATHNAME)).toStrictEqual(RANDOM_CONFIG_FILE_CONTENT);
  });

  test("gha getOrUndefined", () => {
    spyGetInput({
      "present": "value",
      "empty": "",
    });
    expect(getOrUndefined(getInput("empty"))).toStrictEqual(undefined);
    expect(getOrUndefined(getInput("present"))).toStrictEqual("value");
  });

  test("gha getAsCleanedCommaSeparatedList", () => {
    spyGetInput({
      "present": "value1, value2 ,   value3",
      "empty": "",
      "blank": "   ",
      "inner": " inner spaces ",
    });
    expectArrayEqual(getAsCleanedCommaSeparatedList(getInput("present"))!, ["value1", "value2", "value3"]);
    expect(getAsCleanedCommaSeparatedList(getInput("empty"))).toStrictEqual(undefined);
    expect(getAsCleanedCommaSeparatedList(getInput("blank"))).toStrictEqual(undefined);
    expect(getAsCleanedCommaSeparatedList(getInput("inner"))).toStrictEqual(["innerspaces"]);
  });

  test("gha getAsCommaSeparatedList", () => {
    spyGetInput({
      "present": "value1, value2 ,   value3",
      "empty": "",
      "blank": "   ",
      "inner": " inner spaces ",
    });
    expectArrayEqual(getAsCommaSeparatedList(getInput("present"))!, ["value1", "value2", "value3"]);
    expect(getAsCommaSeparatedList(getInput("empty"))).toStrictEqual(undefined);
    expect(getAsCommaSeparatedList(getInput("blank"))).toStrictEqual(undefined);
    expectArrayEqual(getAsCommaSeparatedList(getInput("inner"))!, ["inner spaces"]);
  });
});