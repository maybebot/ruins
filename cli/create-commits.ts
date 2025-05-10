import { exec } from "child_process";
import { writeFile } from "node:fs/promises";
import { promisify } from "node:util";
import { getConfig } from "../config/getConfig.js";
import { resolve } from "node:path";
import consola from "consola";
import type { RuinsCommits, RuinsOutput } from "../types/ruins.js";
import { parseConventionalCommit } from "./utils/conventional-commit.js";

const execPromise = promisify(exec);

/**
 * Create a file collecting all TODOs in the project
 *
 * @param {string} ruinsPath - path to Ruins project directory
 * @returns {Promise<void>}
 */
export const createCommits = async () => {
  const settings = await getConfig();
  const outputFile = resolve(settings.dir, settings.files.commits);

  try {
    const m = settings.commits.months;
    const grepOutput = await execPromise(
      `cd ${process.cwd()} && git log --since="${m} months ago" --pretty=format:"%h | %ae | %s | %ad" --date=short --no-merges`
    );
    const formattedOutput = grepOutput.stdout
      .split(/\r?\n/)
      .map((line) => {
        if (!line) return;
        const [hash, email, message, date] = line.split(" | ");
        return {
          hash,
          email,
          message,
          date,
          meta: parseConventionalCommit(message),
        };
      })
      .filter((line) => line !== undefined);
    const output: RuinsOutput<RuinsCommits> = {
      meta: {
        timestamp: Date.now(),
      },
      data: formattedOutput,
    };
    await writeFile(outputFile, JSON.stringify(output, null, 2));
  } catch {
    consola.error("Something went wrong!");
  }
};
