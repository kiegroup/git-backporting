import LoggerServiceFactory from "@gb/service/logger/logger-service-factory";
import { Moctokit } from "@kie/mock-github";
import { targetOwner, repo, pullRequestNumber, validPR, invalidPullRequestNumber } from "./moctokit-data";

const logger = LoggerServiceFactory.getLogger();

export const setupMoctokit = (): Moctokit => {
  logger.debug("Setting up moctokit..");
  
  const mock = new Moctokit();

  // setup the mock requests here

  // valid requests
  mock.rest.pulls
    .get({
      owner: targetOwner,
      repo: repo,
      pull_number: pullRequestNumber
    })
    .reply({
      status: 200,
      data: validPR
    });
  
  mock.rest.pulls
    .create()
    .reply({
      status: 201,
      data: validPR
    });


  // invalid requests
  mock.rest.pulls
    .get({
      owner: targetOwner,
      repo: repo,
      pull_number: invalidPullRequestNumber
    })
    .reply({
      status: 404,
      data: {
        message: "Not found"
      }
    });
    
  return mock;
};
