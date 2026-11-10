import ScriptService from "@bp/service/script/script-service";
import LoggerServiceFactory from "@bp/service/logger/logger-service-factory";
import { execSync } from "child_process";

jest.mock("child_process");

const execSyncMock = jest.mocked(execSync);
let script: ScriptService;

beforeEach(() => {
  execSyncMock.mockReset();
  jest.spyOn(LoggerServiceFactory.getLogger(), "info").mockImplementation(() => { /* discard */ });
  script = new ScriptService();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("script service", () => {
  test("executes the command in the given directory with captured UTF-8 output", async () => {
    execSyncMock.mockReturnValue("done\n");

    await script.runScript("/work/repo", "go mod tidy && echo done");

    expect(execSyncMock).toHaveBeenCalledTimes(1);
    expect(execSyncMock).toHaveBeenCalledWith("go mod tidy && echo done", {
      cwd: "/work/repo",
      stdio: ["pipe", "pipe", "pipe"],
      encoding: "utf-8",
    });
    expect(LoggerServiceFactory.getLogger().info).toHaveBeenCalledWith("Running script: go mod tidy && echo done");
    expect(LoggerServiceFactory.getLogger().info).toHaveBeenCalledWith("Script output:\ndone\n");
  });

  test.each(["", " \n\t"])("does not log empty or whitespace-only output (%j)", async output => {
    execSyncMock.mockReturnValue(output);

    await expect(script.runScript("/work/repo", "true")).resolves.toBeUndefined();

    expect(LoggerServiceFactory.getLogger().info).toHaveBeenCalledTimes(1);
    expect(LoggerServiceFactory.getLogger().info).toHaveBeenCalledWith("Running script: true");
  });

  test("wraps command failures and preserves the original cause", async () => {
    const cause = new Error("Command failed: exit 1");
    execSyncMock.mockImplementation(() => { throw cause; });

    const result = script.runScript("/work/repo", "exit 1");

    await expect(result).rejects.toThrow("Script failed: Error: Command failed: exit 1");
    await expect(result).rejects.toHaveProperty("cause", cause);
    expect(LoggerServiceFactory.getLogger().info).toHaveBeenCalledTimes(1);
  });
});
