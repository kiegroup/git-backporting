import Logger from "@bp/service/logger/logger";
import LoggerService from "@bp/service/logger/logger-service";

export default class ConsoleLoggerService implements LoggerService {

  private readonly logger;

  constructor() {
    this.logger = new Logger();
  }
  
  trace(message: string): void {
    this.logger.log("[TRACE]", message);
  }
  
  debug(message: string): void {
    this.logger.log("[DEBUG]", message);
  }
  
  info(message: string): void {
    this.logger.log("[INFO]", message);
  }
  
  warn(message: string): void {
    this.logger.log("[WARN]", message);
  }
  
  error(message: string): void {
    this.logger.log("[ERROR]", message);
  }

}