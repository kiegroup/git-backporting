import GitClientFactory from "@bp/service/git/git-client-factory";
import { GitClientType } from "@bp/service/git/git.types";
import GitHubClient from "@bp/service/git/github/github-client";
import GitLabClient from "@bp/service/git/gitlab/gitlab-client";

describe("git client factory test", () => {

  beforeEach(() => {
    // reset git service
    GitClientFactory.reset();
  });

  test("correctly create github client", () => {
    const client = GitClientFactory.getOrCreate(GitClientType.GITHUB, "auth", "apiurl");
    expect(client).toBeInstanceOf(GitHubClient);
  });

  test("correctly create gitlab client", () => {
    const client = GitClientFactory.getOrCreate(GitClientType.GITLAB, "auth", "apiurl");
    expect(client).toBeInstanceOf(GitLabClient);
  });

  test("correctly create codeberg client", () => {
    const client = GitClientFactory.getOrCreate(GitClientType.CODEBERG, "auth", "apiurl");
    expect(client).toBeInstanceOf(GitHubClient);
  });

  test("check get service github", () => {
    const create = GitClientFactory.getOrCreate(GitClientType.GITHUB, "auth", "apiurl");
    const get = GitClientFactory.getClient();
    expect(create).toStrictEqual(get);
  });

  test("check get service gitlab", () => {
    const create = GitClientFactory.getOrCreate(GitClientType.GITLAB, "auth", "apiurl");
    const get = GitClientFactory.getClient();
    expect(create).toStrictEqual(get);
  });

  test("check get service codeberg", () => {
    const create = GitClientFactory.getOrCreate(GitClientType.CODEBERG, "auth", "apiurl");
    const get = GitClientFactory.getClient();
    expect(create).toStrictEqual(get);
  });
});