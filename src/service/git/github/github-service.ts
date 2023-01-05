import GitService from "@bp/service/git/git-service";
import { BackportPullRequest, GitPullRequest } from "@bp/service/git/git.types";
import GitHubMapper from "@bp/service/git/github/github-mapper";
import OctokitFactory from "@bp/service/git/github/octokit-factory";
import LoggerService from "@bp/service/logger/logger-service";
import LoggerServiceFactory from "@bp/service/logger/logger-service-factory";
import { Octokit } from "@octokit/rest";
import { PullRequest } from "@octokit/webhooks-types";

export default class GitHubService implements GitService {
  
  private logger: LoggerService;
  private octokit: Octokit;
  private mapper: GitHubMapper;

  constructor(token: string) {
    this.logger = LoggerServiceFactory.getLogger();
    this.octokit = OctokitFactory.getOctokit(token);
    this.mapper = new GitHubMapper();
  }

  // READ

  async getPullRequest(owner: string, repo: string, prNumber: number): Promise<GitPullRequest> {
    this.logger.info(`Getting pull request ${owner}/${repo}/${prNumber}.`);
    const { data } = await this.octokit.rest.pulls.get({
      owner: owner,
      repo: repo,
      pull_number: prNumber
    });

    return this.mapper.mapPullRequest(data as PullRequest);
  }

  async getPullRequestFromUrl(prUrl: string): Promise<GitPullRequest> {
    const {owner, project} = this.getRepositoryFromPrUrl(prUrl);
    return this.getPullRequest(owner, project, parseInt(prUrl.substring(prUrl.lastIndexOf("/") + 1, prUrl.length)));
  }

  // WRITE
  
  async createPullRequest(backport: BackportPullRequest): Promise<void> {
    this.logger.info(`Creating pull request ${backport.head} -> ${backport.base}.`);
    this.logger.info(`${JSON.stringify(backport, null, 2)}`);

    const { data } = await this.octokit.pulls.create({
      owner: backport.owner,
      repo: backport.repo,
      head: backport.head,
      base: backport.base,
      title: backport.title,
      body: backport.body
    });

    if (backport.reviewers.length > 0) {
      try {
        await this.octokit.pulls.requestReviewers({
          owner: backport.owner,
          repo: backport.repo,
          pull_number: (data as PullRequest).number,
          reviewers: backport.reviewers
        });
      } catch (error) {
        this.logger.error(`Error requesting reviewers: ${error}`);
      }
    }
  }

  // UTILS

  /**
   * Extract repository owner and project from the pull request url
   * @param prUrl pull request url
   * @returns {{owner: string, project: string}}
   */
  private getRepositoryFromPrUrl(prUrl: string): {owner: string, project: string} {
    const elems: string[] = prUrl.split("/");
    return {
      owner: elems[elems.length - 4],
      project: elems[elems.length - 3]
    };
  } 
}