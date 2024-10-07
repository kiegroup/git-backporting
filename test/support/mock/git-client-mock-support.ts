import LoggerServiceFactory from "@bp/service/logger/logger-service-factory";
import { Moctokit } from "@kie/mock-github";
import { TARGET_OWNER, REPO, MERGED_PR_FIXTURE, OPEN_PR_FIXTURE, NOT_MERGED_PR_FIXTURE, NOT_FOUND_PR_NUMBER, MULT_COMMITS_PR_FIXTURE, MULT_COMMITS_PR_COMMITS, NEW_PR_URL, NEW_PR_NUMBER, GITHUB_GET_COMMIT } from "./github-data";
import { CLOSED_NOT_MERGED_MR, MERGED_SQUASHED_MR, NESTED_NAMESPACE_MR, OPEN_MR, OPEN_PR_COMMITS, PROJECT_EXAMPLE, NESTED_PROJECT_EXAMPLE, SUPERUSER, MERGED_SQUASHED_MR_COMMITS, MERGED_NOT_SQUASHED_MR, MERGED_NOT_SQUASHED_MR_COMMITS } from "./gitlab-data";
import { CB_TARGET_OWNER, CB_REPO, CB_MERGED_PR_FIXTURE, CB_OPEN_PR_FIXTURE, CB_NOT_MERGED_PR_FIXTURE, CB_NOT_FOUND_PR_NUMBER, CB_MULT_COMMITS_PR_FIXTURE, CB_MULT_COMMITS_PR_COMMITS, CB_NEW_PR_URL, CB_NEW_PR_NUMBER, CODEBERG_GET_COMMIT } from "./codeberg-data";

// high number, for each test we are not expecting 
// to send more than 3 reqs per api endpoint
const REPEAT = 20;

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
  }  else if (url.endsWith("merge_requests/4")) {
    data = NESTED_NAMESPACE_MR;
  } else if (url.endsWith("merge_requests/5")) {
    data = MERGED_NOT_SQUASHED_MR;
  } else if (url.endsWith("projects/76316")) {
    data = PROJECT_EXAMPLE;
  } else if (url.endsWith("projects/1645")) {
    data = NESTED_PROJECT_EXAMPLE;
  } else if (url.endsWith("users?username=superuser")) {
    data = [SUPERUSER];
  } else if (url.endsWith("merge_requests/1/commits")) {
    data = MERGED_SQUASHED_MR_COMMITS;
  } else if (url.endsWith("merge_requests/2/commits")) {
    data = OPEN_PR_COMMITS;
  } else if (url.endsWith("merge_requests/5/commits")) {
    data = MERGED_NOT_SQUASHED_MR_COMMITS;
  }

  return {
    data,
    status: data ? 200 : 404,
  };
};

export const NEW_GITLAB_MR_ID = 999;
export const SECOND_NEW_GITLAB_MR_ID = 1000;
export const postAxiosMocked = async (url: string, data?: {source_branch: string,}) => {
  let responseData = undefined;

  // gitlab

  if (url.includes("notes")) {
    // creating comments
    responseData = {
      // we do not need the whole response
      iid: NEW_GITLAB_MR_ID,
    };
  } else if (data?.source_branch === "bp-branch") {
    responseData = {
      // we do not need the whole response
      iid: NEW_GITLAB_MR_ID,
      web_url: "https://my.gitlab.host.com/superuser/backporting-example/-/merge_requests/" + NEW_GITLAB_MR_ID
    };
  } else if (data?.source_branch === "bp-branch-2") {
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
      owner: TARGET_OWNER,
      repo: REPO,
      pull_number: MERGED_PR_FIXTURE.number
    })
    .reply({
      status: 200,
      data: MERGED_PR_FIXTURE
    });

  mock.rest.pulls
    .get({
      owner: TARGET_OWNER,
      repo: REPO,
      pull_number: MULT_COMMITS_PR_FIXTURE.number
    })
    .reply({
      status: 200,
      data: MULT_COMMITS_PR_FIXTURE
    });
  
  mock.rest.pulls
    .get({
      owner: TARGET_OWNER,
      repo: REPO,
      pull_number: OPEN_PR_FIXTURE.number
    })
    .reply({
      status: 200,
      data: OPEN_PR_FIXTURE
    });
  
  mock.rest.pulls
    .get({
      owner: TARGET_OWNER,
      repo: REPO,
      pull_number: NOT_MERGED_PR_FIXTURE.number
    })
    .reply({
      status: 200,
      data: NOT_MERGED_PR_FIXTURE
    });
  
  mock.rest.pulls
    .listCommits({
      owner: TARGET_OWNER,
      repo: REPO,
      pull_number: MULT_COMMITS_PR_FIXTURE.number
    })
    .reply({
      status: 200,
      data: MULT_COMMITS_PR_COMMITS
    });
  
  mock.rest.pulls
    .listCommits({
      owner: TARGET_OWNER,
      repo: REPO,
      pull_number: OPEN_PR_FIXTURE.number
    })
    .reply({
      status: 200,
      data: MULT_COMMITS_PR_COMMITS
    });

  mock.rest.pulls
    .create()
    .reply({
      repeat: REPEAT,
      status: 201,
      data: {
        number: NEW_PR_NUMBER,
        html_url: NEW_PR_URL,
      }
    });

  mock.rest.pulls
    .requestReviewers()
    .reply({
      repeat: REPEAT,
      status: 201,
      data: MERGED_PR_FIXTURE
    });

  mock.rest.issues
    .addAssignees()
    .reply({
      repeat: REPEAT,
      status: 201,
      data: {}
    });

  mock.rest.issues
    .addLabels()
    .reply({
      repeat: REPEAT,
      status: 200,
      data: {}
    });

  mock.rest.issues
    .createComment()
    .reply({
      repeat: REPEAT,
      status: 201,
      data: {}
    });

  mock.rest.git
    .getCommit({
      owner: TARGET_OWNER,
      repo: REPO,
      commit_sha: "28f63db774185f4ec4b57cd9aaeb12dbfb4c9ecc",
    })
    .reply({
      status: 200,
      data: GITHUB_GET_COMMIT,
    });

  // invalid requests
  mock.rest.pulls
    .get({
      owner: TARGET_OWNER,
      repo: REPO,
      pull_number: NOT_FOUND_PR_NUMBER
    })
    .reply({
      repeat: REPEAT,
      status: 404,
      data: {
        message: "Not found"
      }
    });

  return mock;
};

// CODEBERG - OCTOKIT

export const mockCodebergClient = (apiUrl = "https://codeberg.org/api/v1"): Moctokit => {
  logger.debug("Setting up moctokit..");
  
  const mock = new Moctokit(apiUrl);

  // setup the mock requests here

  // valid requests
  mock.rest.pulls
    .get({
      owner: CB_TARGET_OWNER,
      repo: CB_REPO,
      pull_number: CB_MERGED_PR_FIXTURE.number
    })
    .reply({
      status: 200,
      data: CB_MERGED_PR_FIXTURE
    });

  mock.rest.pulls
    .get({
      owner: CB_TARGET_OWNER,
      repo: CB_REPO,
      pull_number: CB_MULT_COMMITS_PR_FIXTURE.number
    })
    .reply({
      status: 200,
      data: CB_MULT_COMMITS_PR_FIXTURE
    });
  
  mock.rest.pulls
    .get({
      owner: CB_TARGET_OWNER,
      repo: CB_REPO,
      pull_number: CB_OPEN_PR_FIXTURE.number
    })
    .reply({
      status: 200,
      data: CB_OPEN_PR_FIXTURE
    });
  
  mock.rest.pulls
    .get({
      owner: CB_TARGET_OWNER,
      repo: CB_REPO,
      pull_number: CB_NOT_MERGED_PR_FIXTURE.number
    })
    .reply({
      status: 200,
      data: CB_NOT_MERGED_PR_FIXTURE
    });
  
  mock.rest.pulls
    .listCommits({
      owner: CB_TARGET_OWNER,
      repo: CB_REPO,
      pull_number: CB_MULT_COMMITS_PR_FIXTURE.number
    })
    .reply({
      status: 200,
      data: CB_MULT_COMMITS_PR_COMMITS
    });
  
  mock.rest.pulls
    .listCommits({
      owner: CB_TARGET_OWNER,
      repo: CB_REPO,
      pull_number: CB_OPEN_PR_FIXTURE.number
    })
    .reply({
      status: 200,
      data: CB_MULT_COMMITS_PR_COMMITS
    });

  mock.rest.pulls
    .create()
    .reply({
      repeat: REPEAT,
      status: 201,
      data: {
        number: CB_NEW_PR_NUMBER,
        html_url: CB_NEW_PR_URL,
      }
    });

  mock.rest.pulls
    .requestReviewers()
    .reply({
      repeat: REPEAT,
      status: 201,
      data: CB_MERGED_PR_FIXTURE
    });

  mock.rest.issues
    .addAssignees()
    .reply({
      repeat: REPEAT,
      status: 201,
      data: {}
    });

  mock.rest.issues
    .addLabels()
    .reply({
      repeat: REPEAT,
      status: 200,
      data: {}
    });

  mock.rest.issues
    .createComment()
    .reply({
      repeat: REPEAT,
      status: 201,
      data: {}
    });

  mock.rest.git
    .getCommit({
      owner: CB_TARGET_OWNER,
      repo: CB_REPO,
      commit_sha: "28f63db774185f4ec4b57cd9aaeb12dbfb4c9ecc",
    })
    .reply({
      status: 200,
      data: CODEBERG_GET_COMMIT,
    });

  // invalid requests
  mock.rest.pulls
    .get({
      owner: CB_TARGET_OWNER,
      repo: CB_REPO,
      pull_number: CB_NOT_FOUND_PR_NUMBER
    })
    .reply({
      repeat: REPEAT,
      status: 404,
      data: {
        message: "Not found"
      }
    });

  return mock;
};
