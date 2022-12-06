import ConsoleLoggerService from "@gb/service/logger/console-logger-service";
import LoggerService from "@gb/service/logger/logger-service";

/**
 * Singleton factory class
 */
export default class LoggerServiceFactory {

  private static instance?: LoggerService;

  public static getLogger(): LoggerService {
    if (!LoggerServiceFactory.instance) {
      LoggerServiceFactory.instance = new ConsoleLoggerService();
    }

    return LoggerServiceFactory.instance;
  }
}