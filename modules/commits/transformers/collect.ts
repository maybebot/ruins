import { execFileSync } from "node:child_process";
import { consola } from "consola";
import { parseConventionalCommit } from "./conventional-commit.js";
import type { CommitEntry, RuinsCommitsOutput } from "./types.js";

/** Runs `git log` on demand and parses conventional commits, no cached file needed */
export const getCommitEntries = (months: 1 | 2 | 3 | 4 | 5 | 6): CommitEntry[] => {
  let logOutput: string;
  try {
    logOutput = execFileSync(
      "git",
      [
        "log",
        `--since=${months} months ago`,
        `--pretty=format:%h | %ae | %s | %ad`,
        "--date=short",
        "--no-merges",
      ],
      { cwd: process.cwd(), encoding: "utf8" },
    );
  } catch (error) {
    consola.error("Could not read git log", error);
    return [];
  }

  return logOutput
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      const [hash, email, message, date] = line.split(" | ");
      return { hash, email, message, date, meta: parseConventionalCommit(message) };
    });
};

export const getGitlogData = (months: 1 | 2 | 3 | 4 | 5 | 6): RuinsCommitsOutput => ({
  meta: { timestamp: Date.now() },
  data: getCommitEntries(months),
});
