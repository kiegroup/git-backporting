import { Buffer } from "buffer";
import { appendFile } from "fs/promises";
import { BackportResult } from "./runner";

const escapeHtml = (value: string): string => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

export async function writeBackportSummary(results: BackportResult[]): Promise<void> {
  const path = process.env.GITHUB_STEP_SUMMARY;
  if (!path) {return;}

  const rows: string[] = [];
  const details: string[] = [];
  let size = 0;
  for (const { branch, result, error, url } of results) {
    const safeBranch = escapeHtml(branch);
    const safeUrl = url && /^https?:\/\//i.test(url) ? escapeHtml(url) : undefined;
    const link = safeUrl ? `<a href="${safeUrl}">View pull request</a>` : "-";
    const row = `<tr><td>${safeBranch}</td><td>${result}</td><td>${link}</td></tr>`;
    const detail = result === "KO" ? `<details><summary>Error for ${safeBranch}</summary><pre>${escapeHtml(error.slice(0, 4000))}${error.length > 4000 ? "\n… (truncated)" : ""}</pre></details>` : "";
    size += Buffer.byteLength(row + detail);
    if (size > 500_000) {
      details.push("<p>Additional results omitted because the summary is too large. See the logs for the complete report.</p>");
      break;
    }
    rows.push(row);
    if (detail) {details.push(detail);}
  }
  await appendFile(path, `## Backport results\n\n<table><thead><tr><th>Target branch</th><th>Result</th><th>Pull request</th></tr></thead><tbody>${rows.join("")}</tbody></table>\n\n${details.join("\n")}\n`, "utf8");
}
