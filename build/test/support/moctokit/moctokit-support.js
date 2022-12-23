"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupMoctokit = void 0;
const logger_service_factory_1 = __importDefault(require("../../../src/service/logger/logger-service-factory"));
const mock_github_1 = require("@kie/mock-github");
const moctokit_data_1 = require("./moctokit-data");
const logger = logger_service_factory_1.default.getLogger();
const setupMoctokit = () => {
    logger.debug("Setting up moctokit.");
    const mock = new mock_github_1.Moctokit();
    // setup the mock requests here
    // valid requests
    mock.rest.pulls
        .get({
        owner: moctokit_data_1.targetOwner,
        repo: moctokit_data_1.repo,
        pull_number: moctokit_data_1.mergedPullRequestFixture.number
    })
        .reply({
        status: 200,
        data: moctokit_data_1.mergedPullRequestFixture
    });
    mock.rest.pulls
        .get({
        owner: moctokit_data_1.targetOwner,
        repo: moctokit_data_1.repo,
        pull_number: moctokit_data_1.notMergedPullRequestFixture.number
    })
        .reply({
        status: 200,
        data: moctokit_data_1.notMergedPullRequestFixture
    });
    mock.rest.pulls
        .create()
        .reply({
        status: 201,
        data: moctokit_data_1.mergedPullRequestFixture
    });
    mock.rest.pulls
        .requestReviewers()
        .reply({
        status: 201,
        data: moctokit_data_1.mergedPullRequestFixture
    });
    // invalid requests
    mock.rest.pulls
        .get({
        owner: moctokit_data_1.targetOwner,
        repo: moctokit_data_1.repo,
        pull_number: moctokit_data_1.notFoundPullRequestNumber
    })
        .reply({
        status: 404,
        data: {
            message: "Not found"
        }
    });
    return mock;
};
exports.setupMoctokit = setupMoctokit;
