import { Args } from "@bp/service/args/args.types";
import { AuthTokenId, Configs } from "@bp/service/configs/configs.types";
import LoggerService from "../logger/logger-service";
import LoggerServiceFactory from "../logger/logger-service-factory";
import { GitClientType } from "../git/git.types";

/**
 * Abstract configuration parser class in charge to parse 
 * Args and produces a common Configs object
 */
 export default abstract class ConfigsParser {
  
  protected readonly logger: LoggerService;

  constructor() {
    this.logger = LoggerServiceFactory.getLogger();
  }

  abstract parse(args: Args): Promise<Configs>;

  async parseAndValidate(args: Args): Promise<Configs> {
    const configs: Configs = await this.parse(args);

    // apply validation, throw errors if something is wrong
    
    // if pr is opened check if the there exists one single commit
    if (configs.originalPullRequest.state == "open") {
      this.logger.warn("Trying to backport an open pull request");
    }

    // if PR is closed and not merged throw an error
    if (configs.originalPullRequest.state == "closed" && !configs.originalPullRequest.merged) {
      throw new Error("Provided pull request is closed and not merged");
    }

    return Promise.resolve(configs);
  }

  /**
   * Retrieve the git token from env variable, the default is taken from GIT_TOKEN env.
   * All specific git env variable have precedence and override the default one.
   * @param gitType 
   * @returns tuple where 
   *      - the first element is the corresponding env value
   *      - the second element is true if the value is not undefined nor empty
   */
  public getGitTokenFromEnv(gitType: GitClientType): string | undefined {
    let [token] = this.getEnv(AuthTokenId.GIT_TOKEN);
    let [specToken, specOk]: [string | undefined, boolean] = [undefined, false];
    if (GitClientType.GITHUB == gitType) {
      [specToken, specOk] = this.getEnv(AuthTokenId.GITHUB_TOKEN);
    } else if (GitClientType.GITLAB == gitType) {
      [specToken, specOk] = this.getEnv(AuthTokenId.GITLAB_TOKEN);
    } else if (GitClientType.CODEBERG == gitType) {
      [specToken, specOk] = this.getEnv(AuthTokenId.CODEBERG_TOKEN);
    }

    if (specOk) {
      token = specToken;
    }

    return token;
  }

  /**
   * Get process env variable given the input key string
   * @param key 
   * @returns tuple where 
   *      - the first element is the corresponding env value
   *      - the second element is true if the value is not undefined nor empty
   */
  public getEnv(key: string): [string | undefined, boolean] {
    const val = process.env[key];
    return [val, val !== undefined && val !== ""];
  }
}