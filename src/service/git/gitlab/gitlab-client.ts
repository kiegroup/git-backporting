import LoggerService from "@bp/service/logger/logger-service";
import GitClient from "@bp/service/git/git-client";
import { GitPullRequest, BackportPullRequest } from "@bp/service/git/git.types";
import LoggerServiceFactory from "@bp/service/logger/logger-service-factory";
import { MergeRequestSchema, UserSchema } from "@gitbeaker/rest";
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
        "User-Agent": "lampajr/backporting",
      },
      httpsAgent: new https.Agent({  
        rejectUnauthorized
      })
    });
    this.mapper = new GitLabMapper(this.client);
  }

  getDefaultGitUser(): string {
    return "Gitlab";
  }
  
  getDefaultGitEmail(): string {
    return "noreply@gitlab.com";
  }

  // READ

  // example: <host>/api/v4/projects/alampare%2Fbackporting-example/merge_requests/1
  async getPullRequest(namespace: string, repo: string, mrNumber: number): Promise<GitPullRequest> {
    const projectId = this.getProjectId(namespace, repo);
    const { data } = await this.client.get(`/projects/${projectId}/merge_requests/${mrNumber}`);

    return this.mapper.mapPullRequest(data as MergeRequestSchema);
  }

  getPullRequestFromUrl(mrUrl: string): Promise<GitPullRequest> {
    const { namespace, project, id } = this.extractMergeRequestData(mrUrl);
    return this.getPullRequest(namespace, project, id);
  }
  
  // WRITE
  
  async createPullRequest(backport: BackportPullRequest): Promise<string> {
    this.logger.info(`Creating pull request ${backport.head} -> ${backport.base}.`);
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

    // reviewers
    const reviewerIds: number[] = [];
    for(const r of backport.reviewers) {
      try {
        this.logger.debug("Retrieving user: " + r);
        const user = await this.getUser(r);
        reviewerIds.push(user.id);
      } catch(error) {
        this.logger.warn(`Failed to retrieve reviewer ${r}`);
      }
    }

    if (reviewerIds.length > 0) {
      try {
        this.logger.info("Setting reviewers: " + reviewerIds);
        await this.client.put(`/projects/${projectId}/merge_requests/${mr.iid}`, {
          reviewer_ids: reviewerIds.filter(r => r !== undefined),
        });
      } catch(error) {
        this.logger.warn("Failure trying to update reviewers. " + error);
      }
    }

    // assignees
    const assigneeIds: number[] = [];
    for(const a of backport.assignees) {
      try {
        this.logger.debug("Retrieving user: " + a);
        const user = await this.getUser(a);
        assigneeIds.push(user.id);
      } catch(error) {
        this.logger.warn(`Failed to retrieve assignee ${a}`);
      }
    }
    
    if (assigneeIds.length > 0) {
      try {
        this.logger.info("Setting assignees: " + assigneeIds);
        await this.client.put(`/projects/${projectId}/merge_requests/${mr.iid}`, {
          assignee_ids: assigneeIds.filter(a => a !== undefined),
        });
      } catch(error) {
        this.logger.warn("Failure trying to update assignees. " + error);
      }
    }

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
   * example: <host>/alampare/backporting-example/-/merge_requests/1
   * note: "-/" could be omitted
   * @param mrUrl merge request url
   * @returns {{owner: string, project: string}}
   */
  private extractMergeRequestData(mrUrl: string): {namespace: string, project: string, id: number} {
    const elems: string[] = mrUrl.replace("/-/", "/").split("/");
    return {
      namespace: elems[elems.length - 4],
      project: elems[elems.length - 3],
      id: parseInt(mrUrl.substring(mrUrl.lastIndexOf("/") + 1, mrUrl.length)),
    };
  }

  private getProjectId(namespace: string, repo: string) {
    // e.g., <namespace>%2F<repo>
    return encodeURIComponent(`${namespace}/${repo}`);
  }
}