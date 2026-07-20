import GitClientFactory from "@bp/service/git/git-client-factory";
import { GitPullRequest, GitClientType } from "@bp/service/git/git.types";
import GitHubClient from "@bp/service/git/github/github-client";
import { CB_FORGEJO_OWNER, CB_FORGEJO_REPO, CB_FORGEJO_PR_NUMBER } from "../../../support/mock/codeberg-data";
import { mockCodebergClient } from "../../../support/mock/git-client-mock-support";

describe("codeberg/forgejo service", () => {

  let gitClient: GitHubClient;

  beforeAll(() => {
    // init git service - codeberg client is also used for any Forgejo/Gitea host
    GitClientFactory.reset();
    GitClientFactory.getOrCreate(GitClientType.CODEBERG, "whatever", "https://forgejo.example.org/api/v1");
  });

  beforeEach(() => {
    mockCodebergClient("https://forgejo.example.org/api/v1");

    gitClient = GitClientFactory.getClient() as GitHubClient;
  });

  test("rebase-merged Forgejo PR keeps all commits in order", async () => {
    // Forgejo/Gitea "rebase and merge": the merge commit has a single parent (like a
    // squash) but its message matches the PR's last commit, so it must be recognized as
    // a rebase and ALL commits backported. Forgejo returns git.getCommit with the
    // message nested under `commit`, and no "commits" count on the PR payload - both
    // must be handled.
    const res: GitPullRequest = await gitClient.getPullRequest(CB_FORGEJO_OWNER, CB_FORGEJO_REPO, CB_FORGEJO_PR_NUMBER, undefined);

    expect(res.commits!.length).toBe(7);
    // Forgejo returns commits newest-first; the client reverses them to oldest-first
    // so that cherry-picking applies them in the original order.
    expect(res.commits).toEqual([
      "8dc8e091de0c3b27d9eed248557324696f8625a5",
      "13825cb48276343b243e5b43134a0486a11acd51",
      "74a869c5daddda312b9d7e83c5e08888aaa3eb8d",
      "fad9bcf0f8d015ae805f2828f5af93ae2b29c2eb",
      "53ba2bca30716bf3533116757ef36a85cba0520f",
      "4927a0616b71e4abad92df39721ea5b5e2564e4e",
      "d24517657404d7565699c87fd580eca92d2bb2c4"
    ]);
  });

});
