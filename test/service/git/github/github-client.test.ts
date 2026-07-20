import GitClientFactory from "@bp/service/git/git-client-factory";
import { GitPullRequest, GitClientType } from "@bp/service/git/git.types";
import GitHubClient from "@bp/service/git/github/github-client";
import { MERGED_PR_FIXTURE, REBASE_MERGED_PR_FIXTURE, REPO, TARGET_OWNER } from "../../../support/mock/github-data";
import { mockGitHubClient } from "../../../support/mock/git-client-mock-support";

describe("github service", () => {

  let gitClient: GitHubClient;

  beforeAll(() => {
    // init git service
    GitClientFactory.reset();
    GitClientFactory.getOrCreate(GitClientType.GITHUB, "whatever", "http://localhost/api/v3");
  });

  beforeEach(() => {
    // mock github api calls
    mockGitHubClient("http://localhost/api/v3");

    gitClient = GitClientFactory.getClient() as GitHubClient;
  });

  test("get pull request: success", async () => {
    const res: GitPullRequest = await gitClient.getPullRequest(TARGET_OWNER, REPO, MERGED_PR_FIXTURE.number, true);
    expect(res.sourceRepo).toEqual({
      owner: "fork",
      project: "reponame",
      cloneUrl: "https://github.com/fork/reponame.git"
    });
    expect(res.targetRepo).toEqual({
      owner: "owner",
      project: "reponame",
      cloneUrl: "https://github.com/owner/reponame.git"
    });
    expect(res.title).toBe("PR Title");
    expect(res.commits!.length).toBe(1);
    expect(res.commits).toEqual(["28f63db774185f4ec4b57cd9aaeb12dbfb4c9ecc"]);
  });

  test("get pull request: rebase-merged PR keeps all commits", async () => {
    // A "rebase and merge" produces a merge commit with a single parent, exactly like
    // a squash. It must NOT be treated as a squash, otherwise all but the last commit
    // would be dropped.
    const res: GitPullRequest = await gitClient.getPullRequest(TARGET_OWNER, REPO, REBASE_MERGED_PR_FIXTURE.number, undefined);
    expect(res.commits!.length).toBe(2);
    expect(res.commits).toEqual([
      "0404fb922ab75c3a8aecad5c97d9af388df04695",
      "11da4e38aa3e577ffde6d546f1c52e53b04d3151"
    ]);
  });

});