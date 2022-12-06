import GitServiceFactory from "@gb/service/git/git-service-factory";
import { GitPullRequest, GitServiceType } from "@gb/service/git/git.types";
import GitHubService from "@gb/service/git/github/github-service";
import { pullRequestNumber, repo, targetOwner } from "../../../support/moctokit/moctokit-data";
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
    const res: GitPullRequest = await gitService.getPullRequest(targetOwner, repo, pullRequestNumber);
    expect(res.sourceRepo).toBe("fork/reponame");
    expect(res.targetRepo).toBe("owner/reponame");
    expect(res.title).toBe("PR Title");
    expect(res.commits.length).toBe(1);
    expect(res.commits).toEqual(["28f63db774185f4ec4b57cd9aaeb12dbfb4c9ecc"]);
  });

});