import LoggerServiceFactory from "@bp/service/logger/logger-service-factory";
import { Moctokit } from "@kie/mock-github";
import { targetOwner, repo, mergedPullRequestFixture, openPullRequestFixture, notMergedPullRequestFixture, notFoundPullRequestNumber, sameOwnerPullRequestFixture } from "./moctokit-data";

const logger = LoggerServiceFactory.getLogger();

export const setupMoctokit = (): Moctokit => {
  logger.debug("Setting up moctokit.");
  
  const mock = new Moctokit();

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
    pull_number: sameOwnerPullRequestFixture.number
  })
  .reply({
    status: 200,
    data: sameOwnerPullRequestFixture
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
