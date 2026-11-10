import LoggerService from "@bp/service/logger/logger-service";
import LoggerServiceFactory from "@bp/service/logger/logger-service-factory";
import { execSync } from "child_process";

/**
 * Shell script executor service.
 */
export default class ScriptService {

  private readonly logger: LoggerService;

  constructor() {
    this.logger = LoggerServiceFactory.getLogger();
  }

  /**
   * Run an arbitrary shell command in the given working directory.
   * Throws if the command exits with a non-zero status.
   * @param cwd working directory
   * @param command shell command to execute
   */
  async runScript(cwd: string, command: string): Promise<void> {
    this.logger.info(`Running script: ${command}`);
    try {
      const output = execSync(command, {
        cwd,
        stdio: ["pipe", "pipe", "pipe"],
        encoding: "utf-8",
      });
      if (output && output.trim().length > 0) {
        this.logger.info(`Script output:\n${output}`);
      }
    } catch (error) {
      throw new Error(`Script failed: ${error}`, { cause: error });
    }
  }
}
