import { getEslintIgnoreByFile } from "./formatters/errors.js";
import { getLintIssues } from "../config/getLintIssues.js";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

/**
 * Create a lint file
 *
 * @param {string} ruinsPath - path to Ruins project directory
 * @returns {Promise<void>}
 */
export const addEslintIgnore = async (ruinsPath: string, binPath: string) => {
  const ignoreFilePath = resolve(process.cwd(), "ignores.js");
  const issues = await getLintIssues();

  const ignores = getEslintIgnoreByFile(issues);

  await writeFile(
    ignoreFilePath,
    `export const ruinsIgnores = ${JSON.stringify(ignores, null, 2)}`
  );
};
