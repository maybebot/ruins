import { exec } from "child_process";
import { writeFile } from "node:fs/promises";
import { promisify } from "node:util";
import { getConfig } from "../config/getConfig.js";
import { resolve } from "node:path";
import consola from "consola";
import type { RuinsOutput, RuinsTodos } from "../types/ruins.js";

const execPromise = promisify(exec);

/**
 * Create a file collecting all TODOs in the project
 *
 * @param {string} ruinsPath - path to Ruins project directory
 * @returns {Promise<void>}
 */
export const createTodoFile = async () => {
  const settings = await getConfig();
  const outputFile = resolve(settings.dir, settings.files.todos);
  const searchString = "// TODO";
  try {
    const grepOutput = await execPromise(
      `cd ${process.cwd()} && git grep -rn "${searchString}" *`
    );
    const formattedOutput = grepOutput.stdout
      .split(/\r?\n/)
      .map((line) => {
        if (!line) return;
        const file = line.split(":")[0];
        const todo = line.split("//")[1];
        return {
          file: file,
          todo: `//${todo}`,
        };
      })
      .filter((line) => line !== undefined);
    const output: RuinsOutput<RuinsTodos> = {
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
