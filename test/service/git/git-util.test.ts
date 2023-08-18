import { inferGitApiUrl, inferGitClient } from "@bp/service/git/git-util";
import { GitClientType } from "@bp/service/git/git.types";

describe("check git utilities", () => {

  test("check infer gitlab api", ()=> {
    expect(inferGitApiUrl("https://my.gitlab.awesome.com/superuser/backporting-example/-/merge_requests/4")).toStrictEqual("https://my.gitlab.awesome.com/api/v4");
  });

  test("check infer gitlab api with different version", ()=> {
    expect(inferGitApiUrl("http://my.gitlab.awesome.com/superuser/backporting-example/-/merge_requests/4", "v2")).toStrictEqual("http://my.gitlab.awesome.com/api/v2");
  });

  test("check infer github api", ()=> {
    expect(inferGitApiUrl("https://github.com/superuser/backporting-example/pull/4")).toStrictEqual("https://api.github.com");
  });

  test("check infer custom github api", ()=> {
    expect(inferGitApiUrl("http://github.acme-inc.com/superuser/backporting-example/pull/4")).toStrictEqual("http://github.acme-inc.com/api/v4");
  });

  test("check infer custom github api with different version", ()=> {
    expect(inferGitApiUrl("http://github.acme-inc.com/superuser/backporting-example/pull/4", "v3")).toStrictEqual("http://github.acme-inc.com/api/v3");
  });

  test("check infer github api from github api url", ()=> {
    expect(inferGitApiUrl("https://api.github.com/repos/owner/repo/pulls/1")).toStrictEqual("https://api.github.com");
  });

  test("check infer codeberg api", ()=> {
    expect(inferGitApiUrl("https://codeberg.org/lampajr/backporting-example/pulls/1", "v1")).toStrictEqual("https://codeberg.org/api/v1");
  });

  test("check infer codeberg api", ()=> {
    expect(inferGitApiUrl("https://codeberg.org/lampajr/backporting-example/pulls/1", undefined)).toStrictEqual("https://codeberg.org/api/v4");
  });

  test("check infer github client", ()=> {
    expect(inferGitClient("https://github.com/superuser/backporting-example/pull/4")).toStrictEqual(GitClientType.GITHUB);
  });

  test("check infer gitlab client", ()=> {
    expect(inferGitClient("https://my.gitlab.awesome.com/superuser/backporting-example/-/merge_requests/4")).toStrictEqual(GitClientType.GITLAB);
  });

  test("not recognized git client type", ()=> {
    expect(() => inferGitClient("https://not.recognized/superuser/backporting-example/-/merge_requests/4")).toThrowError("Remote git service not recognized from pr url: https://not.recognized/superuser/backporting-example/-/merge_requests/4");
  });

  test("check infer github client using github api", ()=> {
    expect(inferGitClient("https://api.github.com/repos/owner/repo/pulls/1")).toStrictEqual(GitClientType.GITHUB);
  });

  test("check infer codeberg client", ()=> {
    expect(inferGitClient("https://codeberg.org/lampajr/backporting-example/pulls/1")).toStrictEqual(GitClientType.CODEBERG);
  });
});