/**
 * Logger service interface providing the most commong logging functionalities
 */
export default interface LoggerService {

  setContext(newContext: string): void;

  getContext(): string | undefined;

  clearContext(): void;

  trace(message: string): void;

  debug(message: string): void;

  info(message: string): void;

  warn(message: string): void;

  error(message: string): void;
}