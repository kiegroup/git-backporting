import GitService from "@gb/service/git/git-service";
import { GitPullRequest } from "@gb/service/git/git.types";
import GitHubMapper from "@gb/service/git/github/github-mapper";
import OctokitFactory from "@gb/service/git/github/octokit-factory";
import { Octokit } from "@octokit/rest";
import { PullRequest } from "@octokit/webhooks-types";

export default class GitHubService implements GitService {
  
  private octokit: Octokit;
  private mapper: GitHubMapper;

  constructor(token: string) {
    this.octokit = OctokitFactory.getOctokit(token);
    this.mapper = new GitHubMapper();
  }

  // READ

  async getPullRequest(owner: string, repo: string, prNumber: number): Promise<GitPullRequest> {
    const { data } = await this.octokit.rest.pulls.get({
      owner: owner,
      repo: repo,
      pull_number: prNumber
    });

    return this.mapper.mapPullRequest(data as PullRequest);
  }

  // WRITE
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  createPullRequest(owner: string, repo: string, head: string, base: string, title: string, body: string, reviewers: string[]): Promise<void> {
    // throw new Error("Method not implemented.");
    // TODO implement
    return Promise.resolve();
  }
}