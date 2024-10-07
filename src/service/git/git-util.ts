import LoggerServiceFactory from "@bp/service/logger/logger-service-factory";
import { GitClientType } from "@bp/service/git/git.types";
import { AuthTokenId } from "@bp/service/configs/configs.types";

const PUBLIC_GITHUB_URL = "https://github.com";
const PUBLIC_GITHUB_API = "https://api.github.com";

/**
 * Infer the remote GIT service to interact with based on the provided 
 * pull request URL
 * @param prUrl provided pull request URL
 * @returns {GitClientType}
 */
export const inferGitClient = (prUrl: string): GitClientType => {
  const stdPrUrl = prUrl.toLowerCase().trim();

  if (stdPrUrl.includes(GitClientType.GITHUB.toString())) {
    return GitClientType.GITHUB;
  } else if (stdPrUrl.includes(GitClientType.GITLAB.toString())) {
    return GitClientType.GITLAB;
  } else if (stdPrUrl.includes(GitClientType.CODEBERG.toString())) {
    return GitClientType.CODEBERG;
  }

  throw new Error(`Remote git service not recognized from pr url: ${prUrl}`);
};

/**
 * Infer the host git service from the pull request url
 * @param prUrl pull/merge request url
 * @param apiVersion the api version, ignored in case of public github
 * @returns api URL like https://api.github.com or https://gitlab.com/api/v4
 */
export const inferGitApiUrl = (prUrl: string, apiVersion = "v4"): string => {
  const url = new URL(prUrl);
  const baseUrl = `${url.protocol}//${url.host}`;
  
  if (baseUrl.includes(PUBLIC_GITHUB_URL) || baseUrl.includes(PUBLIC_GITHUB_API)) {
    return PUBLIC_GITHUB_API;
  }

  return `${baseUrl}/api/${apiVersion}`;
};

/**
 * Infer the value of the squash option
 * @param open true if the pull/merge request is still open
 * @param squash_commit undefined or null if the pull/merge request was merged, the sha of the squashed commit if it was squashed
 * @returns true if a single commit must be cherry-picked, false if all merged commits must be cherry-picked
 */
export const inferSquash = (open: boolean, squash_commit: string | undefined | null): boolean => {
  const logger = LoggerServiceFactory.getLogger();

  if (open) {
    logger.debug("cherry-pick all commits because they have not been merged (or squashed) in the base branch yet");
    return false;
  } else {
    if (squash_commit) {
      logger.debug(`cherry-pick the squashed commit ${squash_commit}`);
      return true;
    } else {
      logger.debug("cherry-pick the merged commit(s)");
      return false;
    }
  }
};

/**
 * Retrieve the git token from env variable, the default is taken from GIT_TOKEN env.
 * All specific git env variable have precedence and override the default one.
 * @param gitType 
 * @returns tuple where 
 *      - the first element is the corresponding env value
 *      - the second element is true if the value is not undefined nor empty
 */
export const getGitTokenFromEnv = (gitType: GitClientType): string | undefined => {
  let [token] = getEnv(AuthTokenId.GIT_TOKEN);
  let [specToken, specOk]: [string | undefined, boolean] = [undefined, false];
  if (GitClientType.GITHUB == gitType) {
    [specToken, specOk] = getEnv(AuthTokenId.GITHUB_TOKEN);
  } else if (GitClientType.GITLAB == gitType) {
    [specToken, specOk] = getEnv(AuthTokenId.GITLAB_TOKEN);
  } else if (GitClientType.CODEBERG == gitType) {
    [specToken, specOk] = getEnv(AuthTokenId.CODEBERG_TOKEN);
  }

  if (specOk) {
    token = specToken;
  }

  return token;
};

/**
 * Get process env variable given the input key string
 * @param key 
 * @returns tuple where 
 *      - the first element is the corresponding env value
 *      - the second element is true if the value is not undefined nor empty
 */
export const getEnv = (key: string): [string | undefined, boolean] => {
  const val = process.env[key];
  return [val, val !== undefined && val !== ""];
};