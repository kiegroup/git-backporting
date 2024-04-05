import LoggerService from "@bp/service/logger/logger-service";
import GitClient from "@bp/service/git/git-client";
import { inferSquash } from "@bp/service/git/git-util";
import { GitPullRequest, BackportPullRequest, GitClientType } from "@bp/service/git/git.types";
import LoggerServiceFactory from "@bp/service/logger/logger-service-factory";
import { CommitSchema, MergeRequestSchema, UserSchema } from "@gitbeaker/rest";
import GitLabMapper from "@bp/service/git/gitlab/gitlab-mapper";
import axios, { Axios } from "axios";
import https from "https";

export default class GitLabClient implements GitClient {
  
  private readonly logger: LoggerService;
  private readonly apiUrl: string;
  private readonly mapper: GitLabMapper;
  private readonly client: Axios;

  constructor(token: string | undefined, apiUrl: string, rejectUnauthorized = false) {
    this.logger = LoggerServiceFactory.getLogger();
    this.apiUrl = apiUrl;
    this.client = axios.create({
      baseURL: this.apiUrl,
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "User-Agent": "kiegroup/git-backporting",
      },
      httpsAgent: new https.Agent({  
        rejectUnauthorized
      })
    });
    this.mapper = new GitLabMapper(this.client);
  }

  getClientType(): GitClientType {
    return GitClientType.GITLAB;
  }

  getDefaultGitUser(): string {
    return "Gitlab";
  }
  
  getDefaultGitEmail(): string {
    return "noreply@gitlab.com";
  }

  // READ

  // example: <host>/api/v4/projects/<namespace>%2Fbackporting-example/merge_requests/1
  async getPullRequest(namespace: string, repo: string, mrNumber: number, squash: boolean | undefined): Promise<GitPullRequest> {
    const projectId = this.getProjectId(namespace, repo);
    const { data } = await this.client.get(`/projects/${projectId}/merge_requests/${mrNumber}`);

    if (squash === undefined) {
      squash = inferSquash(data.state === "opened", data.squash_commit_sha);
    }

    const commits: string[] = [];
    if (!squash) {
      // fetch all commits
      try {
        const { data } = await this.client.get(`/projects/${projectId}/merge_requests/${mrNumber}/commits`);

        // gitlab returns them in reverse order
        commits.push(...(data as CommitSchema[]).map(c => c.id).reverse());
      } catch(error) {
        throw new Error(`Failed to retrieve commits for merge request n. ${mrNumber}`);
      }
    }

    return this.mapper.mapPullRequest(data as MergeRequestSchema, commits);
  }

  getPullRequestFromUrl(mrUrl: string, squash: boolean | undefined): Promise<GitPullRequest> {
    const { namespace, project, id } = this.extractMergeRequestData(mrUrl);
    return this.getPullRequest(namespace, project, id, squash);
  }
  
  // WRITE
  
  async createPullRequest(backport: BackportPullRequest): Promise<string> {
    this.logger.info(`Creating pull request ${backport.head} -> ${backport.base}`);
    this.logger.info(`${JSON.stringify(backport, null, 2)}`);

    const projectId = this.getProjectId(backport.owner, backport.repo);

    const { data } = await this.client.post(`/projects/${projectId}/merge_requests`, {
      source_branch: backport.head,
      target_branch: backport.base,
      title: backport.title,
      description: backport.body,
      reviewer_ids: [],
      assignee_ids: [],
    });
    
    const mr = data as MergeRequestSchema;
    const promises = [];

    // labels
    if (backport.labels.length > 0) {
      this.logger.info("Setting labels: " + backport.labels);
      promises.push(
        this.client.put(`/projects/${projectId}/merge_requests/${mr.iid}`, {
          labels: backport.labels.join(","),
        }).catch(error => this.logger.warn("Failure trying to update labels. " + error))
      );
    }

    // comments
    if (backport.comments.length > 0) {
      this.logger.info("Posting comments: " + backport.comments);
      backport.comments.forEach(c => {
        promises.push(
          this.client.post(`/projects/${projectId}/merge_requests/${mr.iid}/notes`, {
            body: c,
          }).catch(error => this.logger.warn("Failure trying to post comment. " + error))
        );
      });
    }

    // reviewers
    const reviewerIds = await Promise.all(backport.reviewers.map(async r => {
      this.logger.debug("Retrieving user: " + r);
      return this.getUser(r).then(user => user.id).catch(
        () => {
          this.logger.warn(`Failed to retrieve reviewer ${r}`);
          return undefined;
        }
      );
    }));

    if (reviewerIds.length > 0) {
      this.logger.info("Setting reviewers: " + reviewerIds);
      promises.push(
        this.client.put(`/projects/${projectId}/merge_requests/${mr.iid}`, {
          reviewer_ids: reviewerIds.filter(r => r !== undefined),
        }).catch(error => this.logger.warn("Failure trying to update reviewers. " + error))
      );
    }

    // assignees
    const assigneeIds = await Promise.all(backport.assignees.map(async a => {
      this.logger.debug("Retrieving user: " + a);
      return this.getUser(a).then(user => user.id).catch(
        () => {
          this.logger.warn(`Failed to retrieve assignee ${a}`);
          return undefined;
        }
      );
    }));
    
    if (assigneeIds.length > 0) {
      this.logger.info("Setting assignees: " + assigneeIds);
      promises.push(
        this.client.put(`/projects/${projectId}/merge_requests/${mr.iid}`, {
          assignee_ids: assigneeIds.filter(a => a !== undefined),
        }).catch(error => this.logger.warn("Failure trying to update assignees. " + error))
      );
    }

    await Promise.all(promises);

    return mr.web_url;
  }

  /**
   * Retrieve a gitlab user given its username
   * @param username 
   * @returns UserSchema
   */
  private async getUser(username: string): Promise<UserSchema> {
    const { data } = await this.client.get(`/users?username=${username}`);
    const users = data as UserSchema[];
    
    if (users.length > 1) {
      throw new Error("Too many users found with username=" + username);
    }
    
    if (users.length == 0) {
      throw new Error("User " + username + " not found");
    }
    
    return users[0];
  }

  /**
   * Extract repository namespace, project and mr number from the merge request url
   * example: <host>/<namespace>/backporting-example/-/merge_requests/1
   * note: "-/" could be omitted
   * @param mrUrl merge request url
   * @returns {{owner: string, project: string}}
   */
  private extractMergeRequestData(mrUrl: string): {namespace: string, project: string, id: number} {
    const { pathname } = new URL(mrUrl);
    const elems: string[] = pathname.substring(1).replace("/-/", "/").split("/");
    let namespace = "";

    for (let i = 0; i < elems.length - 3; i++) {
      namespace += elems[i] + "/";
    }

    namespace = namespace.substring(0, namespace.length - 1);

    return {
      namespace: namespace,
      project: elems[elems.length - 3],
      id: parseInt(mrUrl.substring(mrUrl.lastIndexOf("/") + 1, mrUrl.length)),
    };
  }

  private getProjectId(namespace: string, repo: string) {
    // e.g., <namespace>%2F<repo>
    return encodeURIComponent(`${namespace}/${repo}`);
  }
}