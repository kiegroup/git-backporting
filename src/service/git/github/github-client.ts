import GitClient from "@bp/service/git/git-client";
import { BackportPullRequest, GitPullRequest } from "@bp/service/git/git.types";
import GitHubMapper from "@bp/service/git/github/github-mapper";
import OctokitFactory from "@bp/service/git/github/octokit-factory";
import LoggerService from "@bp/service/logger/logger-service";
import LoggerServiceFactory from "@bp/service/logger/logger-service-factory";
import { Octokit } from "@octokit/rest";
import { PullRequest } from "@octokit/webhooks-types";

export default class GitHubClient implements GitClient {
  
  private logger: LoggerService;
  private apiUrl: string;
  private octokit: Octokit;
  private mapper: GitHubMapper;

  constructor(token: string | undefined, apiUrl: string) {
    this.apiUrl = apiUrl;
    this.logger = LoggerServiceFactory.getLogger();
    this.octokit = OctokitFactory.getOctokit(token, this.apiUrl);
    this.mapper = new GitHubMapper();
  }

  // READ

  getDefaultGitUser(): string {
    return "GitHub";
  }
  
  getDefaultGitEmail(): string {
    return "noreply@github.com";
  }

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
    const { owner, project, id } = this.extractPullRequestData(prUrl);
    return this.getPullRequest(owner, project, id);
  }

  // WRITE
  
  async createPullRequest(backport: BackportPullRequest): Promise<string> {
    this.logger.info(`Creating pull request ${backport.head} -> ${backport.base}.`);
    this.logger.info(`${JSON.stringify(backport, null, 2)}`);

    const { data } = await this.octokit.pulls.create({
      owner: backport.owner,
      repo: backport.repo,
      head: backport.head,
      base: backport.base,
      title: backport.title,
      body: backport.body,
    });

    if (!data) {
      throw new Error("Pull request creation failed");
    }

    if (backport.labels.length > 0) {
      try {
        await this.octokit.issues.addLabels({
          owner: backport.owner,
          repo: backport.repo,
          issue_number: (data as PullRequest).number,
          labels: backport.labels,
        });
      } catch (error) {
        this.logger.error(`Error setting labels: ${error}`);
      }
    }

    if (backport.reviewers.length > 0) {
      try {
        await this.octokit.pulls.requestReviewers({
          owner: backport.owner,
          repo: backport.repo,
          pull_number: (data as PullRequest).number,
          reviewers: backport.reviewers,
        });
      } catch (error) {
        this.logger.error(`Error requesting reviewers: ${error}`);
      }
    }

    if (backport.assignees.length > 0) {
      try {
        await this.octokit.issues.addAssignees({
          owner: backport.owner,
          repo: backport.repo,
          issue_number: (data as PullRequest).number,
          assignees: backport.assignees,
        });
      } catch (error) {
        this.logger.error(`Error setting assignees: ${error}`);
      }
    }

    return data.html_url;
  }

  // UTILS

  /**
   * Extract repository owner and project from the pull request url
   * @param prUrl pull request url
   * @returns {{owner: string, project: string}}
   */
  private extractPullRequestData(prUrl: string): {owner: string, project: string, id: number} {
    const elems: string[] = prUrl.split("/");
    return {
      owner: elems[elems.length - 4],
      project: elems[elems.length - 3],
      id: parseInt(prUrl.substring(prUrl.lastIndexOf("/") + 1, prUrl.length)),
    };
  }
}