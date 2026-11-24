import { execFileSync } from "node:child_process";
import { consola } from "consola";
import { parseConventionalCommit } from "./conventional-commit.js";
import type { CommitEntry, RuinsCommitsOutput } from "./types.js";

/** Runs `git log` on demand and parses conventional commits, no cached file needed */
export const getCommitEntries = (
  months: 1 | 2 | 3 | 4 | 5 | 6,
  cwd = process.cwd(),
  asOf?: string,
): CommitEntry[] => {
  let logOutput: string;
  try {
    const dateArgs = asOf ? getDateRange(months, asOf) : [`--since=${months} months ago`];
    logOutput = execFileSync(
      "git",
      [
        "log",
        ...dateArgs,
        `--pretty=format:%h | %ae | %s | %ad`,
        "--date=short",
        "--no-merges",
      ],
      { cwd, encoding: "utf8" },
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

export const getGitlogData = (
  months: 1 | 2 | 3 | 4 | 5 | 6,
  cwd = process.cwd(),
  asOf?: string,
): RuinsCommitsOutput => ({
  meta: { timestamp: Date.now() },
  data: getCommitEntries(months, cwd, asOf),
});

const getDateRange = (months: number, asOf: string) => {
  const end = new Date(asOf);
  if (Number.isNaN(end.getTime())) throw new Error(`Invalid commit history date: ${asOf}`);

  const targetMonth = end.getUTCMonth() - months;
  const year = end.getUTCFullYear() + Math.floor(targetMonth / 12);
  const month = ((targetMonth % 12) + 12) % 12;
  const day = Math.min(
    end.getUTCDate(),
    new Date(Date.UTC(year, month + 1, 0)).getUTCDate(),
  );
  const since = new Date(
    Date.UTC(
      year,
      month,
      day,
      end.getUTCHours(),
      end.getUTCMinutes(),
      end.getUTCSeconds(),
      end.getUTCMilliseconds(),
    ),
  );
  return [`--since=${since.toISOString()}`, `--until=${end.toISOString()}`];
};
