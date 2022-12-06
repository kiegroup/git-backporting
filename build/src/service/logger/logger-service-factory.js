"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const console_logger_service_1 = __importDefault(require("../../service/logger/console-logger-service"));
/**
 * Singleton factory class
 */
class LoggerServiceFactory {
    static getLogger() {
        if (!LoggerServiceFactory.instance) {
            LoggerServiceFactory.instance = new console_logger_service_1.default();
        }
        return LoggerServiceFactory.instance;
    }
}
exports.default = LoggerServiceFactory;
