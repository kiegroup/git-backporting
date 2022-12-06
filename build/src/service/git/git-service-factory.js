"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const git_types_1 = require("../../service/git/git.types");
const github_service_1 = __importDefault(require("../../service/git/github/github-service"));
/**
 * Singleton git service factory class
 */
class GitServiceFactory {
    static getService() {
        if (!GitServiceFactory.instance) {
            throw new Error("You must call `init` method first!");
        }
        return GitServiceFactory.instance;
    }
    /**
     * Initialize the singleton git management service
     * @param type git management service type
     * @param auth authentication, like github token
     */
    static init(type, auth) {
        if (GitServiceFactory.instance) {
            throw new Error("Git service already initialized!");
        }
        switch (type) {
            case git_types_1.GitServiceType.GITHUB:
                GitServiceFactory.instance = new github_service_1.default(auth);
                break;
            default:
                throw new Error(`Invalid git service type received: ${type}`);
        }
    }
}
exports.default = GitServiceFactory;
