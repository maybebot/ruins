import { getEslintIgnoreByFile } from "./formatters/errors.js";
import { getLintIssues } from "../config/getLintIssues.js";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { getConfig } from "../config/getConfig.js";
import consola from "consola";

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
  consola.info("Looking at lint issues");
  const issues = await getLintIssues();

  const ignores = getEslintIgnoreByFile(issues, settings.eslint.preferOff);

  await writeFile(
    ignoreFilePath,
    `export const ruinsIgnores = ${JSON.stringify(ignores, null, 2)}`
  );
  consola.success(
    `Collected ignores in ${settings.dir}${settings.files.eslintIgnores}`
  );
  consola.info(
    "Now import the file in your eslint config and spread it at the end of the flat config."
  );
};
