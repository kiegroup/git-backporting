import GitCLIService from "@bp/service/git/git-cli";
import { FileState, GitActionTypes, MockGithub } from "@kie/mock-github";
import { spawnSync } from "child_process";
import { assert } from "console";
import path from "path";
import fs from "fs";

let git: GitCLIService;
let cwd: string;
let currentBranch: string;
let pushedBranches: string[];
let localBranches: string[];
let files: FileState[];

const mockGithub = new MockGithub(
  {
    repo: {
      repoA: {
        pushedBranches: ["sbranch", "tbranch"],
        localBranches: ["lbranch"],
        currentBranch: "main",
        history: [
          {
            action: GitActionTypes.PUSH,
            branch: "main",
          },
          {
            action: GitActionTypes.PUSH,
            branch: "sbranch",
          },
          {
            action: GitActionTypes.PUSH,
            branch: "tbranch",
          },
        ],
      },
    },
  },
  path.join(__dirname, "setup-cli")
);

beforeAll(async () => {
  //setup
  await mockGithub.setup();
  cwd = mockGithub.repo.getPath("repoA")!;
  currentBranch = mockGithub.repo.getBranchState("repoA")!.currentBranch;
  pushedBranches = mockGithub.repo.getBranchState("repoA")!.pushedBranches;
  localBranches = mockGithub.repo.getBranchState("repoA")!.localBranches;
  files = (await mockGithub.repo.getFileSystemState("repoA"))!;

  //make sure the setup is correct to run this test suite
  assert(
    pushedBranches.length > 1,
    "your configuration must have a repository with pushed branches other than main"
  );
  assert(
    localBranches.length > 0,
    "your configuration must have a repository with local branches i.e. not pushed branches"
  );
  assert(
    files.length > 0,
    "your configuration needs at least 1 file committed to some branch which is not the current branch"
  );
});

afterAll(async () => {
  await mockGithub.teardown();
});

beforeEach(() => {
  // create a fresh instance of git before each test
  git = new GitCLIService("", "author");
});

describe("git cli service", () => {
  test("version", async () => {
    const result = await git.version(cwd);
    const actualVersion = spawnSync("git", ["version"]).stdout.toString();
    const match = actualVersion.match(/(\d+\.\d+(\.\d+)?)/);
    if (match) {
      expect(result).toEqual(match[1]);
    } else {
      expect(result).toBe(undefined);
    }
  });

  test("fetch", async () => {
    await expect(git.fetch(cwd, currentBranch)).resolves.not.toThrowError();
  });

  test("local branch", async () => {
    await expect(git.createLocalBranch(cwd, "new-local-branch")).resolves.not.toThrowError();

    // use rev-parse to double check the current branch is the new one
    const output = spawnSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], { cwd }).stdout.toString().trim();
    expect(output).toEqual("new-local-branch");
  });

  test("push local branch", async () => {
    const expressionToTest = "GIT_CHERRY_SHOULD_NOT_INCLUDE_THIS_MSG";
    // create file to push
    fs.writeFileSync(path.join(cwd, "test-push"), "testing git push");
  
    // add and commit the file
    spawnSync("git", ["add", "."], { cwd });
    spawnSync("git", ["commit", "-m", expressionToTest], { cwd });
  
    await git.push(cwd, currentBranch, "origin", false);
  
    // use git cherry to verify this commit was pushed
    const output = spawnSync("git", ["cherry", "-v"], { cwd }).stdout.toString();
    expect(output.includes(expressionToTest)).toBe(false);
  });
});