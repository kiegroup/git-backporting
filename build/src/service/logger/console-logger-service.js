"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("../../service/logger/logger"));
class ConsoleLoggerService {
    constructor() {
        this.logger = new logger_1.default();
    }
    trace(message) {
        this.logger.log("[TRACE]", message);
    }
    debug(message) {
        this.logger.log("[DEBUG]", message);
    }
    info(message) {
        this.logger.log("[INFO]", message);
    }
    warn(message) {
        this.logger.log("[WARN]", message);
    }
    error(message) {
        this.logger.log("[ERROR]", message);
    }
}
exports.default = ConsoleLoggerService;
