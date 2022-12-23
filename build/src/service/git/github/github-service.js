"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const github_mapper_1 = __importDefault(require("../../../service/git/github/github-mapper"));
const octokit_factory_1 = __importDefault(require("../../../service/git/github/octokit-factory"));
const logger_service_factory_1 = __importDefault(require("../../../service/logger/logger-service-factory"));
class GitHubService {
    constructor(token) {
        this.logger = logger_service_factory_1.default.getLogger();
        this.octokit = octokit_factory_1.default.getOctokit(token);
        this.mapper = new github_mapper_1.default();
    }
    // READ
    async getPullRequest(owner, repo, prNumber) {
        this.logger.info(`Getting pull request ${owner}/${repo}/${prNumber}.`);
        const { data } = await this.octokit.rest.pulls.get({
            owner: owner,
            repo: repo,
            pull_number: prNumber
        });
        return this.mapper.mapPullRequest(data);
    }
    async getPullRequestFromUrl(prUrl) {
        const { owner, project } = this.getRepositoryFromPrUrl(prUrl);
        return this.getPullRequest(owner, project, parseInt(prUrl.substring(prUrl.lastIndexOf("/") + 1, prUrl.length)));
    }
    // WRITE
    async createPullRequest(backport) {
        this.logger.info(`Creating pull request ${backport.head} -> ${backport.base}.`);
        this.logger.info(`${JSON.stringify(backport, null, 2)}`);
        const { data } = await this.octokit.pulls.create({
            owner: backport.owner,
            repo: backport.repo,
            head: backport.head,
            base: backport.base,
            title: backport.title,
            body: backport.body
        });
        if (backport.reviewers.length > 0) {
            try {
                await this.octokit.pulls.requestReviewers({
                    owner: backport.owner,
                    repo: backport.repo,
                    pull_number: data.number,
                    reviewers: backport.reviewers
                });
            }
            catch (error) {
                this.logger.error(`Error requesting reviewers: ${error}`);
            }
        }
    }
    // UTILS
    /**
     * Extract repository owner and project from the pull request url
     * @param prUrl pull request url
     * @returns {{owner: string, project: string}}
     */
    getRepositoryFromPrUrl(prUrl) {
        const elems = prUrl.split("/");
        return {
            owner: elems[elems.length - 4],
            project: elems[elems.length - 3]
        };
    }
}
exports.default = GitHubService;
