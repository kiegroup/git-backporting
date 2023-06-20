import ArgsParser from "@bp/service/args/args-parser";
import Runner from "@bp/service/runner/runner";
import GitCLIService from "@bp/service/git/git-cli";
import GitHubService from "@bp/service/git/github/github-service";
import CLIArgsParser from "@bp/service/args/cli/cli-args-parser";
import { addProcessArgs, resetProcessArgs } from "../../support/utils";
import { setupMoctokit } from "../../support/moctokit/moctokit-support";

jest.mock("@bp/service/git/git-cli");
jest.spyOn(GitHubService.prototype, "createPullRequest");

let parser: ArgsParser;
let runner: Runner;

beforeEach(() => {
  setupMoctokit();

  // create CLI arguments parser
  parser = new CLIArgsParser();

  // create runner
  runner = new Runner(parser);
});

afterEach(() => {
  jest.clearAllMocks();
  
  // reset process.env variables
  resetProcessArgs();
});

describe("cli runner", () => {
  test("with dry run", async () => {
    addProcessArgs([
      "-d",
      "-tb",
      "target",
      "-pr",
      "https://github.com/owner/reponame/pull/2368"
    ]);
    
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

  test("overriding author", async () => {
    addProcessArgs([
      "-d",
      "-tb",
      "target",
      "-pr",
      "https://github.com/owner/reponame/pull/2368"
    ]);
    
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

  test("with relative folder", async () => {
    addProcessArgs([
      "-d",
      "-tb",
      "target",
      "-pr",
      "https://github.com/owner/reponame/pull/2368",
      "-f",
      "folder"
    ]);
    
    await runner.execute();

    const cwd = process.cwd() + "/folder";

    expect(GitCLIService.prototype.clone).toBeCalledTimes(1);
    expect(GitCLIService.prototype.clone).toBeCalledWith("https://github.com/owner/reponame.git", cwd, "target");

    expect(GitCLIService.prototype.createLocalBranch).toBeCalledTimes(1);
    expect(GitCLIService.prototype.createLocalBranch).toBeCalledWith(cwd, "bp-target-28f63db774185f4ec4b57cd9aaeb12dbfb4c9ecc");
    
    expect(GitCLIService.prototype.fetch).toBeCalledTimes(1);
    expect(GitCLIService.prototype.fetch).toBeCalledWith(cwd, "pull/2368/head:pr/2368");

    expect(GitCLIService.prototype.cherryPick).toBeCalledTimes(1);
    expect(GitCLIService.prototype.cherryPick).toBeCalledWith(cwd, "28f63db774185f4ec4b57cd9aaeb12dbfb4c9ecc");

    expect(GitCLIService.prototype.addRemote).toBeCalledTimes(0);
    expect(GitCLIService.prototype.addRemote).toBeCalledTimes(0);

    expect(GitCLIService.prototype.push).toBeCalledTimes(0);
    expect(GitHubService.prototype.createPullRequest).toBeCalledTimes(0);
  });

  test("with absolute folder", async () => {
    addProcessArgs([
      "-d",
      "-tb",
      "target",
      "-pr",
      "https://github.com/owner/reponame/pull/2368",
      "-f",
      "/tmp/folder"
    ]);
    
    await runner.execute();

    const cwd = "/tmp/folder";

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
    addProcessArgs([
      "-tb",
      "target",
      "-pr",
      "https://github.com/owner/reponame/pull/2368"
    ]);
    
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

  test("same owner", async () => {
    addProcessArgs([
      "-tb",
      "target",
      "-pr",
      "https://github.com/owner/reponame/pull/8632"
    ]);
    
    await runner.execute();

    const cwd = process.cwd() + "/bp";

    expect(GitCLIService.prototype.clone).toBeCalledTimes(1);
    expect(GitCLIService.prototype.clone).toBeCalledWith("https://github.com/owner/reponame.git", cwd, "target");

    expect(GitCLIService.prototype.createLocalBranch).toBeCalledTimes(1);
    expect(GitCLIService.prototype.createLocalBranch).toBeCalledWith(cwd, "bp-target-28f63db774185f4ec4b57cd9aaeb12dbfb4c9ecc");
    
    expect(GitCLIService.prototype.fetch).toBeCalledTimes(0);

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
        body: expect.stringContaining("**Backport:** https://github.com/owner/reponame/pull/8632"),
        reviewers: ["gh-user", "that-s-a-user"]
      }
    );
  });

  test("closed and not merged pull request", async () => {
    addProcessArgs([
      "-tb",
      "target",
      "-pr",
      "https://github.com/owner/reponame/pull/6666"
    ]);

    expect(async () => await runner.execute()).rejects.toThrow("Provided pull request is closed and not merged!");
  });

  test("open pull request", async () => {
    addProcessArgs([
      "-tb",
      "target",
      "-pr",
      "https://github.com/owner/reponame/pull/4444"
    ]);

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

  test("override backporting pr data", async () => {
    addProcessArgs([
      "-tb",
      "target",
      "-pr",
      "https://github.com/owner/reponame/pull/2368",
      "--title",
      "New Title",
      "--body",
      "New Body",
      "--body-prefix",
      "New Body Prefix - ",
      "--bp-branch-name",
      "bp_branch_name",
    ]);
    
    await runner.execute();

    const cwd = process.cwd() + "/bp";

    expect(GitCLIService.prototype.clone).toBeCalledTimes(1);
    expect(GitCLIService.prototype.clone).toBeCalledWith("https://github.com/owner/reponame.git", cwd, "target");

    expect(GitCLIService.prototype.createLocalBranch).toBeCalledTimes(1);
    expect(GitCLIService.prototype.createLocalBranch).toBeCalledWith(cwd, "bp_branch_name");
    
    expect(GitCLIService.prototype.fetch).toBeCalledTimes(1);
    expect(GitCLIService.prototype.fetch).toBeCalledWith(cwd, "pull/2368/head:pr/2368");

    expect(GitCLIService.prototype.cherryPick).toBeCalledTimes(1);
    expect(GitCLIService.prototype.cherryPick).toBeCalledWith(cwd, "28f63db774185f4ec4b57cd9aaeb12dbfb4c9ecc");

    expect(GitCLIService.prototype.push).toBeCalledTimes(1);
    expect(GitCLIService.prototype.push).toBeCalledWith(cwd, "bp_branch_name");

    expect(GitHubService.prototype.createPullRequest).toBeCalledTimes(1);
    expect(GitHubService.prototype.createPullRequest).toBeCalledWith({
        owner: "owner", 
        repo: "reponame", 
        head: "bp_branch_name", 
        base: "target", 
        title: "New Title", 
        body: "New Body Prefix - New Body",
        reviewers: ["gh-user", "that-s-a-user"]
      }
    );
  });
});