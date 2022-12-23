import GitServiceFactory from "@bp/service/git/git-service-factory";
import { GitPullRequest, GitServiceType } from "@bp/service/git/git.types";
import GitHubService from "@bp/service/git/github/github-service";
import { mergedPullRequestFixture, repo, targetOwner } from "../../../support/moctokit/moctokit-data";
import { setupMoctokit } from "../../../support/moctokit/moctokit-support";

describe("github service", () => {

  let gitService: GitHubService;

  beforeAll(() => {
    // init git service
    GitServiceFactory.init(GitServiceType.GITHUB, "whatever");
  });

  beforeEach(() => {
    // mock github api calls
    setupMoctokit();

    gitService = GitServiceFactory.getService() as GitHubService;
  });

  test("get pull request: success", async () => {
    const res: GitPullRequest = await gitService.getPullRequest(targetOwner, repo, mergedPullRequestFixture.number);
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
    expect(res.commits.length).toBe(1);
    expect(res.commits).toEqual(["28f63db774185f4ec4b57cd9aaeb12dbfb4c9ecc"]);
  });

});