"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Common logger class based on the console.log functionality
 */
class Logger {
    log(prefix, ...str) {
        // eslint-disable-next-line no-console
        console.log.apply(console, [prefix, ...str]);
    }
    emptyLine() {
        this.log("", "");
    }
}
exports.default = Logger;
