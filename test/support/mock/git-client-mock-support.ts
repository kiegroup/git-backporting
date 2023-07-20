import LoggerServiceFactory from "@bp/service/logger/logger-service-factory";
import { Moctokit } from "@kie/mock-github";
import { targetOwner, repo, mergedPullRequestFixture, openPullRequestFixture, notMergedPullRequestFixture, notFoundPullRequestNumber, multipleCommitsPullRequestFixture, multipleCommitsPullRequestCommits } from "./github-data";
import { CLOSED_NOT_MERGED_MR, MERGED_SQUASHED_MR, OPEN_MR, OPEN_PR_COMMITS, PROJECT_EXAMPLE, SUPERUSER} from "./gitlab-data";

const logger = LoggerServiceFactory.getLogger();

// AXIOS

export const getAxiosMocked = (url: string) => {
  let data = undefined;

  // gitlab

  if (url.endsWith("merge_requests/1")) {
    data = MERGED_SQUASHED_MR;
  } else if (url.endsWith("merge_requests/2")) {
    data = OPEN_MR;
  } else if (url.endsWith("merge_requests/3")) {
    data = CLOSED_NOT_MERGED_MR;
  } else if (url.endsWith("projects/76316")) {
    data = PROJECT_EXAMPLE;
  } else if (url.endsWith("users?username=superuser")) {
    data = [SUPERUSER];
  } else if (url.endsWith("merge_requests/2/commits")) {
    data = OPEN_PR_COMMITS;
  }

  return {
    data,
    status: data ? 200 : 404,
  };
};

export const NEW_GITLAB_MR_ID = 999;
export const SECOND_NEW_GITLAB_MR_ID = 1000;
export const postAxiosMocked = (_url: string, data?: {source_branch: string,}) => {
  let responseData = undefined;

  // gitlab

  if (data?.source_branch === "bp-branch") {
    responseData = {
      // we do not need the whole response
      iid: NEW_GITLAB_MR_ID,
      web_url: "https://my.gitlab.host.com/superuser/backporting-example/-/merge_requests/" + NEW_GITLAB_MR_ID
    };
  } if (data?.source_branch === "bp-branch-2") {
    responseData = {
      // we do not need the whole response
      iid: SECOND_NEW_GITLAB_MR_ID,
      web_url: "https://my.gitlab.host.com/superuser/backporting-example/-/merge_requests/" + SECOND_NEW_GITLAB_MR_ID
    };
  }

  return {
    data: responseData,
    status: responseData ? 200 : 404,
  };
};

export const putAxiosMocked = async (url: string, _data?: unknown) => {
  const responseData = undefined;

  // gitlab

  if (url.endsWith(`merge_requests/${NEW_GITLAB_MR_ID}`)) {
    return {
      data: {
        iid: NEW_GITLAB_MR_ID,
      },
      status: responseData ? 200 : 404,
    };
  }

  throw new Error("Error updating merge request: " + url);
};

// GITHUB - OCTOKIT

export const mockGitHubClient = (apiUrl = "https://api.github.com"): Moctokit => {
  logger.debug("Setting up moctokit..");
  
  const mock = new Moctokit(apiUrl);

  // setup the mock requests here

  // valid requests
  mock.rest.pulls
    .get({
      owner: targetOwner,
      repo: repo,
      pull_number: mergedPullRequestFixture.number
    })
    .reply({
      status: 200,
      data: mergedPullRequestFixture
    });

  mock.rest.pulls
    .get({
      owner: targetOwner,
      repo: repo,
      pull_number: multipleCommitsPullRequestFixture.number
    })
    .reply({
      status: 200,
      data: multipleCommitsPullRequestFixture
    });
  
  mock.rest.pulls
    .get({
      owner: targetOwner,
      repo: repo,
      pull_number: openPullRequestFixture.number
    })
    .reply({
      status: 200,
      data: openPullRequestFixture
    });
  
  mock.rest.pulls
    .get({
      owner: targetOwner,
      repo: repo,
      pull_number: notMergedPullRequestFixture.number
    })
    .reply({
      status: 200,
      data: notMergedPullRequestFixture
    });
  
  mock.rest.pulls
    .listCommits({
      owner: targetOwner,
      repo: repo,
      pull_number: multipleCommitsPullRequestFixture.number
    })
    .reply({
      status: 200,
      data: multipleCommitsPullRequestCommits
    });
  
  mock.rest.pulls
    .create()
    .reply({
      status: 201,
      data: mergedPullRequestFixture
    });

  mock.rest.pulls
    .requestReviewers()
    .reply({
      status: 201,
      data: mergedPullRequestFixture
    });

  mock.rest.issues
    .addAssignees()
    .reply({
      status: 201,
      data: {}
    });

  mock.rest.issues
    .addLabels()
    .reply({
      status: 200,
      data: {}
    });

  // invalid requests
  mock.rest.pulls
    .get({
      owner: targetOwner,
      repo: repo,
      pull_number: notFoundPullRequestNumber
    })
    .reply({
      status: 404,
      data: {
        message: "Not found"
      }
    });
    
  return mock;
};
