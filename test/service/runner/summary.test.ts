import { mkdtemp, readFile, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { writeBackportSummary } from "@bp/service/runner/summary";

test("writes escaped results, links, and expandable failure details to the step summary", async () => {
  const directory = await mkdtemp(join(tmpdir(), "backport-summary-"));
  const path = join(directory, "summary");
  const previous = process.env.GITHUB_STEP_SUMMARY;
  try {
    await writeFile(path, "Existing content\n");
    process.env.GITHUB_STEP_SUMMARY = path;
    await writeBackportSummary([
      { branch: "release/<v1>", result: "OK", error: "-", url: "https://github.com/org/repo/pull/1" },
      { branch: "prod", result: "KO", error: "conflict <file>\nsecond line" },
      { branch: "stable", result: "SKIPPED", error: "-" },
    ]);
    const summary = await readFile(path, "utf8");
    expect(summary).toContain("Existing content\n");
    expect(summary).toContain("release/&lt;v1&gt;");
    expect(summary).toContain("<a href=\"https://github.com/org/repo/pull/1\">View pull request</a>");
    expect(summary).toContain("<summary>Error for prod</summary><pre>conflict &lt;file&gt;\nsecond line</pre>");
    expect(summary).toContain("<td>stable</td><td>SKIPPED</td>");
  } finally {
    if (previous === undefined) {delete process.env.GITHUB_STEP_SUMMARY;}
    else {process.env.GITHUB_STEP_SUMMARY = previous;}
    await rm(directory, { recursive: true, force: true });
  }
});
