import { GitClientType } from "@bp/service/git/git.types";

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