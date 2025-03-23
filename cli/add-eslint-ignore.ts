import { getEslintIgnoreByFile } from "./formatters/errors.js";
import { getLintIssues } from "../config/getLintIssues.js";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { getConfig } from "../config/getConfig.js";

/**
 * Create a lint file
 *
 * @param {string} ruinsPath - path to Ruins project directory
 * @returns {Promise<void>}
 */
export const addEslintIgnore = async () => {
  const settings = await getConfig();
  const ignoreFilePath = resolve(
    process.cwd(),
    settings.dir,
    settings.files.eslintIgnores
  );
  const issues = await getLintIssues();

  const ignores = getEslintIgnoreByFile(issues, settings.eslint.preferOff);

  await writeFile(
    ignoreFilePath,
    `export const ruinsIgnores = ${JSON.stringify(ignores, null, 2)}`
  );
};
