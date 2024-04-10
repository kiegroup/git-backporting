import Logger from "@bp/service/logger/logger";
import LoggerService from "@bp/service/logger/logger-service";

export default class ConsoleLoggerService implements LoggerService {

  private readonly logger: Logger;
  private readonly verbose: boolean;
  private context?: string;

  constructor(verbose = true) {
    this.logger = new Logger();
    this.verbose = verbose;
  }

  setContext(newContext: string) {
    this.context = newContext;
  }

  getContext(): string | undefined {
    return this.context;
  }

  clearContext() {
    this.context = undefined;
  }
  
  trace(message: string): void {
    this.logger.log("TRACE", this.fromContext(message));
  }
  
  debug(message: string): void {
    if (this.verbose) {
      this.logger.log("DEBUG", this.fromContext(message));
    }
  }
  
  info(message: string): void {
    this.logger.log("INFO", this.fromContext(message));
  }
  
  warn(message: string): void {
    this.logger.log("WARN", this.fromContext(message));
  }
  
  error(message: string): void {
    this.logger.log("ERROR", this.fromContext(message));
  }

  private fromContext(msg: string): string {
    return this.context ? `[${this.context}] ${msg}` : msg;
  }
}