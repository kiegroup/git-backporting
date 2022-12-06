"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_service_factory_1 = __importDefault(require("../../../service/logger/logger-service-factory"));
const rest_1 = require("@octokit/rest");
/**
 * Singleton factory class for {Octokit} instance
 */
class OctokitFactory {
    static getOctokit(token) {
        if (!OctokitFactory.octokit) {
            OctokitFactory.logger.info("Creating octokit instance..");
            OctokitFactory.octokit = new rest_1.Octokit({
                auth: token,
                userAgent: "lampajr/backporting"
            });
        }
        return OctokitFactory.octokit;
    }
}
exports.default = OctokitFactory;
OctokitFactory.logger = logger_service_factory_1.default.getLogger();
