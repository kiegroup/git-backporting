"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const github_mapper_1 = __importDefault(require("../../../service/git/github/github-mapper"));
const octokit_factory_1 = __importDefault(require("../../../service/git/github/octokit-factory"));
class GitHubService {
    constructor(token) {
        this.octokit = octokit_factory_1.default.getOctokit(token);
        this.mapper = new github_mapper_1.default();
    }
    // READ
    async getPullRequest(owner, repo, prNumber) {
        const { data } = await this.octokit.rest.pulls.get({
            owner: owner,
            repo: repo,
            pull_number: prNumber
        });
        return this.mapper.mapPullRequest(data);
    }
    // WRITE
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    createPullRequest(owner, repo, head, base, title, body, reviewers) {
        // throw new Error("Method not implemented.");
        // TODO implement
        return Promise.resolve();
    }
}
exports.default = GitHubService;
