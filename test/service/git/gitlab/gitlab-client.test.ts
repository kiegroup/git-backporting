import GitClientFactory from "@bp/service/git/git-client-factory";
import { NEW_GITLAB_MR_ID, SECOND_NEW_GITLAB_MR_ID, getAxiosMocked, postAxiosMocked, putAxiosMocked } from "../../../support/mock/git-client-mock-support";
import { BackportPullRequest, GitClientType, GitPullRequest } from "@bp/service/git/git.types";
import GitLabClient from "@bp/service/git/gitlab/gitlab-client";
import axios from "axios";

jest.mock("axios");
const axiosSpy = axios.create as jest.Mock;
let axiosInstanceSpy: {[key: string]: jest.Func};

function setupAxiosSpy() {
  const getSpy = jest.fn(getAxiosMocked);
  const postSpy = jest.fn(postAxiosMocked);
  const putSpy = jest.fn(putAxiosMocked);
  const axiosInstance = {
    get: getSpy,
    post: postSpy,
    put: putSpy,
  };
  axiosSpy.mockImplementation(() => (axiosInstance));
  return axiosInstance;
}

describe("github service", () => {
  let gitClient: GitLabClient;

  beforeEach(() => {
    axiosInstanceSpy = setupAxiosSpy();
    GitClientFactory.reset();
    gitClient = GitClientFactory.getOrCreate(GitClientType.GITLAB, "whatever", "apiUrl") as GitLabClient;
  });
  
  test("get merged pull request", async () => {
    const res: GitPullRequest = await gitClient.getPullRequest("superuser", "backporting-example", 1);
    
    // check content
    expect(res.sourceRepo).toEqual({
      owner: "superuser",
      project: "backporting-example",
      cloneUrl: "https://my.gitlab.host.com/superuser/backporting-example.git"
    });
    expect(res.targetRepo).toEqual({
      owner: "superuser",
      project: "backporting-example",
      cloneUrl: "https://my.gitlab.host.com/superuser/backporting-example.git"
    });
    expect(res.title).toBe("Update test.txt");
    expect(res.commits!.length).toBe(1);
    expect(res.commits).toEqual(["ebb1eca696c42fd067658bd9b5267709f78ef38e"]);
    
    // check axios invocation
    expect(axiosInstanceSpy.get).toBeCalledTimes(3); // merge request and 2 repos
    expect(axiosInstanceSpy.get).toBeCalledWith("/projects/superuser%2Fbackporting-example/merge_requests/1");
    expect(axiosInstanceSpy.get).toBeCalledWith("/projects/76316");
    expect(axiosInstanceSpy.get).toBeCalledWith("/projects/76316");
  });

  test("get open pull request", async () => {
    const res: GitPullRequest = await gitClient.getPullRequest("superuser", "backporting-example", 2);
    expect(res.sourceRepo).toEqual({
      owner: "superuser",
      project: "backporting-example",
      cloneUrl: "https://my.gitlab.host.com/superuser/backporting-example.git"
    });
    expect(res.targetRepo).toEqual({
      owner: "superuser",
      project: "backporting-example",
      cloneUrl: "https://my.gitlab.host.com/superuser/backporting-example.git"
    });
    expect(res.title).toBe("Update test.txt opened");
    expect(res.commits!.length).toBe(1);
    expect(res.commits).toEqual(["9e15674ebd48e05c6e428a1fa31dbb60a778d644"]);

    // check axios invocation
    expect(axiosInstanceSpy.get).toBeCalledTimes(3); // merge request and 2 repos
    expect(axiosInstanceSpy.get).toBeCalledWith("/projects/superuser%2Fbackporting-example/merge_requests/2");
    expect(axiosInstanceSpy.get).toBeCalledWith("/projects/76316");
    expect(axiosInstanceSpy.get).toBeCalledWith("/projects/76316");
  });

  test("create backport pull request without reviewers and assignees", async () => {
    const backport: BackportPullRequest = {
      title: "Backport Title",
      body: "Backport Body",
      owner: "superuser",
      repo: "backporting-example",
      base: "old/branch",
      head: "bp-branch",
      reviewers: [],
      assignees: [],
      labels: [],
      comments: [],
    };
    
    const url: string = await gitClient.createPullRequest(backport);
    expect(url).toStrictEqual("https://my.gitlab.host.com/superuser/backporting-example/-/merge_requests/" + NEW_GITLAB_MR_ID);

    // check axios invocation
    expect(axiosInstanceSpy.post).toBeCalledTimes(1);
    expect(axiosInstanceSpy.post).toBeCalledWith("/projects/superuser%2Fbackporting-example/merge_requests", expect.objectContaining({
      source_branch: "bp-branch",
      target_branch: "old/branch",
      title: "Backport Title",
      description: "Backport Body",
      reviewer_ids: [],
      assignee_ids: [],
    }));
    expect(axiosInstanceSpy.get).toBeCalledTimes(0); // no reviewers nor assignees
    expect(axiosInstanceSpy.put).toBeCalledTimes(0); // no reviewers nor assignees
  });

  test("create backport pull request with reviewers", async () => {
    const backport: BackportPullRequest = {
      title: "Backport Title",
      body: "Backport Body",
      owner: "superuser",
      repo: "backporting-example",
      base: "old/branch",
      head: "bp-branch",
      reviewers: ["superuser", "invalid"],
      assignees: [],
      labels: [],
      comments: [],
    };
    
    const url: string = await gitClient.createPullRequest(backport);
    expect(url).toStrictEqual("https://my.gitlab.host.com/superuser/backporting-example/-/merge_requests/" + NEW_GITLAB_MR_ID);

    // check axios invocation
    expect(axiosInstanceSpy.post).toBeCalledTimes(1);
    expect(axiosInstanceSpy.post).toBeCalledWith("/projects/superuser%2Fbackporting-example/merge_requests", expect.objectContaining({
      source_branch: "bp-branch",
      target_branch: "old/branch",
      title: "Backport Title",
      description: "Backport Body",
      reviewer_ids: [],
      assignee_ids: [],
    }));
    expect(axiosInstanceSpy.get).toBeCalledTimes(2); // just reviewers, one invalid
    expect(axiosInstanceSpy.get).toBeCalledWith("/users?username=superuser");
    expect(axiosInstanceSpy.get).toBeCalledWith("/users?username=invalid");
    expect(axiosInstanceSpy.put).toBeCalledTimes(1); // just reviewers
    expect(axiosInstanceSpy.put).toBeCalledWith("/projects/superuser%2Fbackporting-example/merge_requests/" + NEW_GITLAB_MR_ID, {
      reviewer_ids: [14041],
    });
  });

  test("create backport pull request with assignees", async () => {
    const backport: BackportPullRequest = {
      title: "Backport Title",
      body: "Backport Body",
      owner: "superuser",
      repo: "backporting-example",
      base: "old/branch",
      head: "bp-branch",
      reviewers: [],
      assignees: ["superuser", "invalid"],
      labels: [],
      comments: [],
    };
    
    const url: string = await gitClient.createPullRequest(backport);
    expect(url).toStrictEqual("https://my.gitlab.host.com/superuser/backporting-example/-/merge_requests/" + NEW_GITLAB_MR_ID);

    // check axios invocation
    expect(axiosInstanceSpy.post).toBeCalledTimes(1);
    expect(axiosInstanceSpy.post).toBeCalledWith("/projects/superuser%2Fbackporting-example/merge_requests", expect.objectContaining({
      source_branch: "bp-branch",
      target_branch: "old/branch",
      title: "Backport Title",
      description: "Backport Body",
      reviewer_ids: [],
      assignee_ids: [],
    }));
    expect(axiosInstanceSpy.get).toBeCalledTimes(2); // just assignees, one invalid
    expect(axiosInstanceSpy.get).toBeCalledWith("/users?username=superuser");
    expect(axiosInstanceSpy.get).toBeCalledWith("/users?username=invalid");
    expect(axiosInstanceSpy.put).toBeCalledTimes(1); // just assignees
    expect(axiosInstanceSpy.put).toBeCalledWith("/projects/superuser%2Fbackporting-example/merge_requests/" + NEW_GITLAB_MR_ID, {
      assignee_ids: [14041],
    });
  });

  test("create backport pull request with failure assigning reviewers", async () => {
    const backport: BackportPullRequest = {
      title: "Backport Title",
      body: "Backport Body",
      owner: "superuser",
      repo: "backporting-example",
      base: "old/branch",
      head: "bp-branch-2",
      reviewers: ["superuser", "invalid"],
      assignees: [],
      labels: [],
      comments: [],
    };
    
    const url: string = await gitClient.createPullRequest(backport);
    expect(url).toStrictEqual("https://my.gitlab.host.com/superuser/backporting-example/-/merge_requests/" + SECOND_NEW_GITLAB_MR_ID);

    // check axios invocation
    expect(axiosInstanceSpy.post).toBeCalledTimes(1);
    expect(axiosInstanceSpy.post).toBeCalledWith("/projects/superuser%2Fbackporting-example/merge_requests", expect.objectContaining({
      source_branch: "bp-branch-2",
      target_branch: "old/branch",
      title: "Backport Title",
      description: "Backport Body",
      reviewer_ids: [],
      assignee_ids: [],
    }));
    expect(axiosInstanceSpy.get).toBeCalledTimes(2); // just reviewers, one invalid
    expect(axiosInstanceSpy.get).toBeCalledWith("/users?username=superuser");
    expect(axiosInstanceSpy.get).toBeCalledWith("/users?username=invalid");
    expect(axiosInstanceSpy.put).toBeCalledTimes(1); // just reviewers
    expect(axiosInstanceSpy.put).toBeCalledWith("/projects/superuser%2Fbackporting-example/merge_requests/" + SECOND_NEW_GITLAB_MR_ID, {
      reviewer_ids: [14041],
    });
  });

  test("create backport pull request with failure assigning assignees", async () => {
    const backport: BackportPullRequest = {
      title: "Backport Title",
      body: "Backport Body",
      owner: "superuser",
      repo: "backporting-example",
      base: "old/branch",
      head: "bp-branch-2",
      reviewers: [],
      assignees: ["superuser", "invalid"],
      labels: [],
      comments: [],
    };
    
    const url: string = await gitClient.createPullRequest(backport);
    expect(url).toStrictEqual("https://my.gitlab.host.com/superuser/backporting-example/-/merge_requests/" + SECOND_NEW_GITLAB_MR_ID);

    // check axios invocation
    expect(axiosInstanceSpy.post).toBeCalledTimes(1);
    expect(axiosInstanceSpy.post).toBeCalledWith("/projects/superuser%2Fbackporting-example/merge_requests", expect.objectContaining({
      source_branch: "bp-branch-2",
      target_branch: "old/branch",
      title: "Backport Title",
      description: "Backport Body",
      reviewer_ids: [],
      assignee_ids: [],
    }));
    expect(axiosInstanceSpy.get).toBeCalledTimes(2); // just assignees, one invalid
    expect(axiosInstanceSpy.get).toBeCalledWith("/users?username=superuser");
    expect(axiosInstanceSpy.get).toBeCalledWith("/users?username=invalid");
    expect(axiosInstanceSpy.put).toBeCalledTimes(1); // just assignees
    expect(axiosInstanceSpy.put).toBeCalledWith("/projects/superuser%2Fbackporting-example/merge_requests/" + SECOND_NEW_GITLAB_MR_ID, {
      assignee_ids: [14041],
    });
  });

  test("create backport pull request with custom labels", async () => {
    const backport: BackportPullRequest = {
      title: "Backport Title",
      body: "Backport Body",
      owner: "superuser",
      repo: "backporting-example",
      base: "old/branch",
      head: "bp-branch-2",
      reviewers: [],
      assignees: [],
      labels: ["label1", "label2"],
      comments: [],
    };
    
    const url: string = await gitClient.createPullRequest(backport);
    expect(url).toStrictEqual("https://my.gitlab.host.com/superuser/backporting-example/-/merge_requests/" + SECOND_NEW_GITLAB_MR_ID);

    // check axios invocation
    expect(axiosInstanceSpy.post).toBeCalledTimes(1);
    expect(axiosInstanceSpy.post).toBeCalledWith("/projects/superuser%2Fbackporting-example/merge_requests", expect.objectContaining({
      source_branch: "bp-branch-2",
      target_branch: "old/branch",
      title: "Backport Title",
      description: "Backport Body",
      reviewer_ids: [],
      assignee_ids: [],
    }));
    expect(axiosInstanceSpy.get).toBeCalledTimes(0);
    expect(axiosInstanceSpy.put).toBeCalledTimes(1); // just labels
    expect(axiosInstanceSpy.put).toBeCalledWith("/projects/superuser%2Fbackporting-example/merge_requests/" + SECOND_NEW_GITLAB_MR_ID, {
      labels: "label1,label2",
    });
  });

  test("create backport pull request with post comments", async () => {
    const backport: BackportPullRequest = {
      title: "Backport Title",
      body: "Backport Body",
      owner: "superuser",
      repo: "backporting-example",
      base: "old/branch",
      head: "bp-branch-2",
      reviewers: [],
      assignees: [],
      labels: [],
      comments: ["this is first comment", "this is second comment"],
    };
    
    const url: string = await gitClient.createPullRequest(backport);
    expect(url).toStrictEqual("https://my.gitlab.host.com/superuser/backporting-example/-/merge_requests/" + SECOND_NEW_GITLAB_MR_ID);

    // check axios invocation
    expect(axiosInstanceSpy.post).toBeCalledTimes(1);
    expect(axiosInstanceSpy.post).toBeCalledWith("/projects/superuser%2Fbackporting-example/merge_requests", expect.objectContaining({
      source_branch: "bp-branch-2",
      target_branch: "old/branch",
      title: "Backport Title",
      description: "Backport Body",
      reviewer_ids: [],
      assignee_ids: [],
    }));
    expect(axiosInstanceSpy.get).toBeCalledTimes(0);
    // FIXME
    // expect(axiosInstanceSpy.put).toBeCalledTimes(1); // just comments
    // expect(axiosInstanceSpy.put).toBeCalledWith("/projects/superuser%2Fbackporting-example/merge_requests/" + SECOND_NEW_GITLAB_MR_ID, {
    //   labels: "label1,label2",
    // });
  });
});