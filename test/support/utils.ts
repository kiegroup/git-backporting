import * as core from "@actions/core";
import * as fs from "fs";

export const addProcessArgs = (args: string[]) => {
  process.argv = [...process.argv, ...args];
};

export const resetProcessArgs = () => {
  process.argv = ["node", "backporting"];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const spyGetInput = (obj: any) => {
  const mock = jest.spyOn(core, "getInput");
  mock.mockImplementation((name: string) : string => {
    return obj[name] ?? "";
  });
};

/**
 * Check array equality performing sort on both sides.
 * DO NOT USE this if ordering matters
 * @param actual 
 * @param expected 
 */
export const expectArrayEqual = (actual: unknown[], expected: unknown[]) => {
  expect(actual.sort()).toEqual(expected.sort());
};

/**
 * Create a test file given the full pathname
 * @param pathname full file pathname e.g, /tmp/dir/filename.json
 * @param content what must be written in the file
 */
export const createTestFile = (pathname: string, content: string) => {
  fs.writeFileSync(pathname, content);
};

/**
 * Remove a file located at pathname
 * @param pathname full file pathname e.g, /tmp/dir/filename.json
 */
export const removeTestFile = (pathname: string) => {
  fs.rmSync(pathname);
};