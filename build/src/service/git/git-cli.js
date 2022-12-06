"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_service_factory_1 = __importDefault(require("../../service/logger/logger-service-factory"));
const simple_git_1 = __importDefault(require("simple-git"));
const fs_1 = __importDefault(require("fs"));
/**
 * Command line git commands executor service
 */
class GitCLIService {
    constructor() {
        this.logger = logger_service_factory_1.default.getLogger();
    }
    /**
     * Return a pre-configured SimpleGit instance able to execute commands from current
     * directory or the provided one
     * @param cwd [optional] current working directory
     * @returns {SimpleGit}
     */
    git(cwd) {
        const gitConfig = { ...(cwd ? { baseDir: cwd } : {}) };
        return (0, simple_git_1.default)(gitConfig).addConfig("user.name", "Github").addConfig("user.email", "noreply@github.com");
    }
    /**
     * Return the git version
     * @returns {Promise<string | undefined>}
     */
    async version() {
        const rawOutput = await this.git().raw("version");
        const match = rawOutput.match(/(\d+\.\d+(\.\d+)?)/);
        return match ? match[1] : undefined;
    }
    /**
     * Clone a git repository
     * @param from url or path from which the repository should be cloned from
     * @param to location at which the repository should be cloned at
     * @param branch branch which should be cloned
     */
    async clone(from, to, branch) {
        this.logger.info(`Cloning repository ${from}..`);
        if (!fs_1.default.existsSync(to)) {
            await this.git().clone(from, to, ["--quiet", "--shallow-submodules", "--no-tags", "--branch", branch]);
        }
        else {
            this.logger.warn(`Folder ${to} already exist. Won't clone`);
        }
    }
    /**
     * Create a new branch starting from the current one and checkout in it
     * @param cwd repository in which createBranch should be performed
     * @param newBranch new branch name
     */
    async createLocalBranch(cwd, newBranch) {
        this.logger.info(`Creating branch ${newBranch}..`);
        await this.git(cwd).checkoutLocalBranch(newBranch);
    }
    /**
     * Add a new remote to the current repository
     * @param cwd repository in which addRemote should be performed
     * @param remote remote git link
     * @param remoteName [optional] name of the remote, by default 'fork' is used
     */
    async addRemote(cwd, remote, remoteName = "fork") {
        this.logger.info(`Adding new remote ${remote}..`);
        await this.git(cwd).addRemote(remoteName, remote);
    }
    /**
     * Git fetch from a particular branch
     * @param cwd repository in which fetch should be performed
     * @param branch fetch from the given branch
     * @param remote [optional] the remote to fetch, by default origin
     */
    async fetch(cwd, branch, remote = "origin") {
        await this.git(cwd).fetch(remote, branch, ["--quiet"]);
    }
    /**
     * Get cherry-pick a specific sha
     * @param cwd repository in which the sha should be cherry picked to
     * @param sha commit sha
     */
    async cherryPick(cwd, sha) {
        this.logger.info(`Cherry picking ${sha}..`);
        await this.git(cwd).raw(["cherry-pick", "--strategy=recursive", "-X", "theirs", sha]);
    }
    /**
     * Push a branch to a remote
     * @param cwd repository in which the push should be performed
     * @param branch branch to be pushed
     * @param remote [optional] remote to which the branch should be pushed to, by default 'origin'
     */
    async push(cwd, branch, remote = "origin", force = false) {
        this.logger.info(`Pushing ${branch} to ${remote}..`);
        const options = ["--quiet"];
        if (force) {
            options.push("--force-with-lease");
        }
        await this.git(cwd).push(remote, branch, options);
    }
}
exports.default = GitCLIService;
