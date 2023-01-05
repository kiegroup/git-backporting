import ArgsParser from "@bp/service/args/args-parser";
import Runner from "@bp/service/runner/runner";
import GitCLIService from "@bp/service/git/git-cli";
import GitHubService from "@bp/service/git/github/github-service";
import GHAArgsParser from "@bp/service/args/gha/gha-args-parser";
import { spyGetInput } from "../../support/utils";
import { setupMoctokit } from "../../support/moctokit/moctokit-support";

jest.mock("@bp/service/git/git-cli");
jest.spyOn(GitHubService.prototype, "createPullRequest");

let parser: ArgsParser;
let runner: Runner;

beforeEach(() => {
  setupMoctokit();

  // create GHA arguments parser
  parser = new GHAArgsParser();

  // create runner
  runner = new Runner(parser);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("gha runner", () => {
  test("with dry run", async () => {
    spyGetInput({
      "dry-run": "true",
      "target-branch": "target",
      "pull-request": "https://github.com/owner/reponame/pull/2368"
    });
    
    await runner.execute();

    const cwd = process.cwd() + "/bp";

    expect(GitCLIService.prototype.clone).toBeCalledTimes(1);
    expect(GitCLIService.prototype.clone).toBeCalledWith("https://github.com/owner/reponame.git", cwd, "target");

    expect(GitCLIService.prototype.createLocalBranch).toBeCalledTimes(1);
    expect(GitCLIService.prototype.createLocalBranch).toBeCalledWith(cwd, "bp-target-28f63db774185f4ec4b57cd9aaeb12dbfb4c9ecc");
    
    expect(GitCLIService.prototype.fetch).toBeCalledTimes(1);
    expect(GitCLIService.prototype.fetch).toBeCalledWith(cwd, "pull/2368/head:pr/2368");

    expect(GitCLIService.prototype.cherryPick).toBeCalledTimes(1);
    expect(GitCLIService.prototype.cherryPick).toBeCalledWith(cwd, "28f63db774185f4ec4b57cd9aaeb12dbfb4c9ecc");

    expect(GitCLIService.prototype.push).toBeCalledTimes(0);
    expect(GitHubService.prototype.createPullRequest).toBeCalledTimes(0);
  });

  test("without dry run", async () => {
    spyGetInput({
      "target-branch": "target",
      "pull-request": "https://github.com/owner/reponame/pull/2368"
    });

    await runner.execute();

    const cwd = process.cwd() + "/bp";

    expect(GitCLIService.prototype.clone).toBeCalledTimes(1);
    expect(GitCLIService.prototype.clone).toBeCalledWith("https://github.com/owner/reponame.git", cwd, "target");

    expect(GitCLIService.prototype.createLocalBranch).toBeCalledTimes(1);
    expect(GitCLIService.prototype.createLocalBranch).toBeCalledWith(cwd, "bp-target-28f63db774185f4ec4b57cd9aaeb12dbfb4c9ecc");
    
    expect(GitCLIService.prototype.fetch).toBeCalledTimes(1);
    expect(GitCLIService.prototype.fetch).toBeCalledWith(cwd, "pull/2368/head:pr/2368");

    expect(GitCLIService.prototype.cherryPick).toBeCalledTimes(1);
    expect(GitCLIService.prototype.cherryPick).toBeCalledWith(cwd, "28f63db774185f4ec4b57cd9aaeb12dbfb4c9ecc");

    expect(GitCLIService.prototype.push).toBeCalledTimes(1);
    expect(GitCLIService.prototype.push).toBeCalledWith(cwd, "bp-target-28f63db774185f4ec4b57cd9aaeb12dbfb4c9ecc");

    expect(GitHubService.prototype.createPullRequest).toBeCalledTimes(1);
    expect(GitHubService.prototype.createPullRequest).toBeCalledWith({
        owner: "owner", 
        repo: "reponame", 
        head: "bp-target-28f63db774185f4ec4b57cd9aaeb12dbfb4c9ecc", 
        base: "target", 
        title: "[target] PR Title", 
        body: expect.stringContaining("**Backport:** https://github.com/owner/reponame/pull/2368"),
        reviewers: ["gh-user", "that-s-a-user"]
      }
    );
  });

  test("closed and not merged pull request", async () => {
    spyGetInput({
      "target-branch": "target",
      "pull-request": "https://github.com/owner/reponame/pull/6666"
    });

    expect(async () => await runner.execute()).rejects.toThrow("Provided pull request is closed and not merged!");
  });

  test("open pull request", async () => {
    spyGetInput({
      "target-branch": "target",
      "pull-request": "https://github.com/owner/reponame/pull/4444"
    });

    await runner.execute();

    const cwd = process.cwd() + "/bp";

    expect(GitCLIService.prototype.clone).toBeCalledTimes(1);
    expect(GitCLIService.prototype.clone).toBeCalledWith("https://github.com/owner/reponame.git", cwd, "target");

    expect(GitCLIService.prototype.createLocalBranch).toBeCalledTimes(1);
    expect(GitCLIService.prototype.createLocalBranch).toBeCalledWith(cwd, "bp-target-91748965051fae1330ad58d15cf694e103267c87");
    
    expect(GitCLIService.prototype.fetch).toBeCalledTimes(1);
    expect(GitCLIService.prototype.fetch).toBeCalledWith(cwd, "pull/4444/head:pr/4444");

    expect(GitCLIService.prototype.cherryPick).toBeCalledTimes(1);
    expect(GitCLIService.prototype.cherryPick).toBeCalledWith(cwd, "91748965051fae1330ad58d15cf694e103267c87");

    expect(GitCLIService.prototype.push).toBeCalledTimes(1);
    expect(GitCLIService.prototype.push).toBeCalledWith(cwd, "bp-target-91748965051fae1330ad58d15cf694e103267c87");

    expect(GitHubService.prototype.createPullRequest).toBeCalledTimes(1);
    expect(GitHubService.prototype.createPullRequest).toBeCalledWith({
        owner: "owner", 
        repo: "reponame", 
        head: "bp-target-91748965051fae1330ad58d15cf694e103267c87", 
        base: "target", 
        title: "[target] PR Title", 
        body: expect.stringContaining("**Backport:** https://github.com/owner/reponame/pull/4444"),
        reviewers: ["gh-user", "that-s-a-user"]
      }
    );
  });
});