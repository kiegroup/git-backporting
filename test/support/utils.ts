import * as core from "@actions/core";

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