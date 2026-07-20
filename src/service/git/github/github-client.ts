import GitClient from "@bp/service/git/git-client";
import { inferSquash } from "@bp/service/git/git-util";
import { BackportPullRequest, GitClientType, GitPullRequest } from "@bp/service/git/git.types";
import GitHubMapper from "@bp/service/git/github/github-mapper";
import OctokitFactory from "@bp/service/git/github/octokit-factory";
import LoggerService from "@bp/service/logger/logger-service";
import LoggerServiceFactory from "@bp/service/logger/logger-service-factory";
import { Octokit } from "@octokit/rest";
import { PullRequest } from "@octokit/webhooks-types";

export default class GitHubClient implements GitClient {

  private logger: LoggerService;
  private apiUrl: string;
  private isForCodeberg: boolean;
  private octokit: Octokit;
  private mapper: GitHubMapper;

  constructor(token: string | undefined, apiUrl: string, isForCodeberg = false) {
    this.apiUrl = apiUrl;
    this.isForCodeberg = isForCodeberg;
    this.logger = LoggerServiceFactory.getLogger();
    this.octokit = OctokitFactory.getOctokit(token, this.apiUrl);
    this.mapper = new GitHubMapper();
  }

  getClientType(): GitClientType {
    return this.isForCodeberg ? GitClientType.CODEBERG : GitClientType.GITHUB;
  }

  // READ

  getDefaultGitUser(): string {
    return this.apiUrl.includes(GitClientType.CODEBERG.toString()) ? "Codeberg" : "GitHub";
  }

  getDefaultGitEmail(): string {
    return "noreply@github.com";
  }

  async getPullRequest(owner: string, repo: string, prNumber: number, squash: boolean | undefined): Promise<GitPullRequest> {
    this.logger.debug(`Fetching pull request ${owner}/${repo}/${prNumber}`);
    const { data } = await this.octokit.rest.pulls.get({
      owner: owner,
      repo: repo,
      pull_number: prNumber,
    });

    const open: boolean = data.state == "open";

    // commits belonging to the pull request, lazily fetched (and cached) since they
    // may be needed both to infer the squash flag and to actually cherry-pick them
    let prCommits: { sha: string; message: string }[] | undefined = undefined;

    if (squash === undefined) {
      let commit_sha: string | undefined = undefined;
      if (!open) {
	const commit = await this.octokit.rest.git.getCommit({
          owner: owner,
          repo: repo,
          commit_sha: (data.merge_commit_sha as string),
	});
        // A merge commit with a single parent is produced by BOTH a "squash and merge"
        // and a "rebase and merge", so the parent count alone cannot tell them apart.
        // A rebase replays every commit of the pull request preserving
        // its message, hence the merge commit (the tip of the replayed chain) shares its
        // message with one of the pull request commits. A squash instead collapses all
        // commits into a single new commit with a synthesized message. A single-commit
        // pull request is treated as a squash since both strategies are equivalent there.
        // Note: we rely on the actual number of fetched commits rather than a "commits"
        // count on the PR payload, since Forgejo/Gitea do not return such a field.
        if (commit.data.parents.length === 1) {
          let rebaseMerged = false;
          if (data.merged) {
            prCommits = await this.getCommits(owner, repo, prNumber);
            const mergeCommitMessage = this.extractCommitMessage(commit.data);
            rebaseMerged = prCommits.length > 1 && mergeCommitMessage !== undefined && prCommits.some(c => c.message === mergeCommitMessage);
          }
          if (!rebaseMerged) {
            commit_sha = (data.merge_commit_sha as string);
          }
        }
      }
      squash = inferSquash(open, commit_sha);
    }

    const commits: string[] = [];
    if (!squash) {
      // reuse the commits already fetched while inferring the squash flag, if any
      const list = prCommits ?? await this.getCommits(owner, repo, prNumber);
      commits.push(...list.map(c => c.sha));
    }

    return this.mapper.mapPullRequest(data as PullRequest, commits);
  }

  async getPullRequestFromUrl(prUrl: string, squash: boolean | undefined): Promise<GitPullRequest> {
    const { owner, project, id } = this.extractPullRequestData(prUrl);
    return this.getPullRequest(owner, project, id, squash);
  }

  /**
   * Read the message out of a git.getCommit response. GitHub returns it at the top level
   * (`message`), whereas Gitea/Forgejo nest it under `commit` (`commit.message`). Support
   * both shapes so rebase-vs-squash detection works across providers.
   */
  private extractCommitMessage(commitData: unknown): string | undefined {
    const data = commitData as { message?: string; commit?: { message?: string } };
    return data.message ?? data.commit?.message;
  }

  /**
   * Fetch all commits belonging to the given pull request, ordered from the oldest
   * to the newest.
   * @returns list of commits, each with its sha and message
   */
  private async getCommits(owner: string, repo: string, prNumber: number): Promise<{ sha: string; message: string }[]> {
    try {
      const { data } = await this.octokit.rest.pulls.listCommits({
        owner: owner,
        repo: repo,
        pull_number: prNumber,
      });

      const commits = data.map(c => ({ sha: c.sha, message: c.commit.message }));
      if (this.isForCodeberg) {
        // For some reason, even though Codeberg advertises API compatibility
        // with GitHub, it returns commits in reversed order.
        commits.reverse();
      }
      return commits;
    } catch (error) {
      throw new Error(`Failed to retrieve commits for pull request n. ${prNumber}`);
    }
  }

  // WRITE

  async createPullRequest(backport: BackportPullRequest): Promise<string> {
    this.logger.info(`Creating pull request ${backport.head} -> ${backport.base}`);
    this.logger.info(`${JSON.stringify(backport, null, 2)}`);

    const { data } = await this.octokit.pulls.create({
      owner: backport.owner,
      repo: backport.repo,
      head: backport.headRepo ? `${backport.headRepo.owner}:${backport.head}` : backport.head,
      ...(backport.headRepo ? { head_repo: backport.headRepo.project } : {}),
      base: backport.base,
      title: backport.title,
      body: backport.body,
    });

    if (!data) {
      throw new Error("Pull request creation failed");
    }

    const promises = [];

    if (backport.labels.length > 0) {
      promises.push(
        this.octokit.issues.addLabels({
          owner: backport.owner,
          repo: backport.repo,
          issue_number: (data as PullRequest).number,
          labels: backport.labels,
        }).catch(error => this.logger.error(`Error setting labels: ${error}`))
      );
    }

    if (backport.reviewers.length > 0) {
      promises.push(
        this.octokit.pulls.requestReviewers({
          owner: backport.owner,
          repo: backport.repo,
          pull_number: (data as PullRequest).number,
          reviewers: backport.reviewers,
        }).catch(error => this.logger.error(`Error requesting reviewers: ${error}`))
      );
    }

    if (backport.assignees.length > 0) {
      promises.push(
        this.octokit.issues.addAssignees({
          owner: backport.owner,
          repo: backport.repo,
          issue_number: (data as PullRequest).number,
          assignees: backport.assignees,
        }).catch(error => this.logger.error(`Error setting assignees: ${error}`))
      );
    }

    if (backport.comments.length > 0) {
      backport.comments.forEach(c => {
        promises.push(
          this.octokit.issues.createComment({
            owner: backport.owner,
            repo: backport.repo,
            issue_number: (data as PullRequest).number,
            body: c,
          }).catch(error => this.logger.error(`Error posting comment: ${error}`))
        );
      });
    }

    await Promise.all(promises);

    return data.html_url;
  }

  async createPullRequestComment(prUrl: string, comment: string): Promise<string | undefined> {
    let commentUrl: string | undefined = undefined;
    try {
      const { owner, project, id } = this.extractPullRequestData(prUrl);
      const { data } = await this.octokit.issues.createComment({
        owner: owner,
        repo: project,
        issue_number: id,
        body: comment
      });

      if (!data) {
        throw new Error("Pull request comment creation failed");
      }

      commentUrl = data.url;
    } catch (error) {
      this.logger.error(`Error creating comment on pull request ${prUrl}: ${error}`);
    }

    return commentUrl;
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