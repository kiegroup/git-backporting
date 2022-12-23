"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const git_service_factory_1 = __importDefault(require("../../../../src/service/git/git-service-factory"));
const git_types_1 = require("../../../../src/service/git/git.types");
const moctokit_data_1 = require("../../../support/moctokit/moctokit-data");
const moctokit_support_1 = require("../../../support/moctokit/moctokit-support");
describe("github service", () => {
    let gitService;
    beforeAll(() => {
        // init git service
        git_service_factory_1.default.init(git_types_1.GitServiceType.GITHUB, "whatever");
    });
    beforeEach(() => {
        // mock github api calls
        (0, moctokit_support_1.setupMoctokit)();
        gitService = git_service_factory_1.default.getService();
    });
    test("get pull request: success", async () => {
        const res = await gitService.getPullRequest(moctokit_data_1.targetOwner, moctokit_data_1.repo, moctokit_data_1.mergedPullRequestFixture.number);
        expect(res.sourceRepo).toEqual({
            owner: "fork",
            project: "reponame",
            cloneUrl: "https://github.com/fork/reponame.git"
        });
        expect(res.targetRepo).toEqual({
            owner: "owner",
            project: "reponame",
            cloneUrl: "https://github.com/owner/reponame.git"
        });
        expect(res.title).toBe("PR Title");
        expect(res.commits.length).toBe(1);
        expect(res.commits).toEqual(["28f63db774185f4ec4b57cd9aaeb12dbfb4c9ecc"]);
    });
});
