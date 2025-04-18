import { execSync } from "child_process";
import { writeFile } from "node:fs/promises";
import { getConfig } from "../config/getConfig.js";
import { resolve } from "node:path";
import consola from "consola";

/**
 * Create a lint file
 *
 * @param {string} ruinsPath - path to Ruins project directory
 * @returns {Promise<void>}
 */
export const createLintFile = async (ruinsPath: string, binPath: string) => {
  const settings = await getConfig();
  const outputFile = resolve(settings.dir, settings.files.eslintIssues);
  const ignoresFile = resolve(settings.dir, settings.files.eslintIgnores);
  consola.info(`Searching for linting issues`);

  // reset to avoid skipping already ignored issues
  const resetConent = `export const ruinsIgnores = [];`;
  await writeFile(ignoresFile, resetConent);

  try {
    await execSync(
      `${binPath}/eslint --quiet -o ${outputFile} -f ${ruinsPath}/dist/cli/formatters/output.js`
    );
    consola.success(`Collected issues in ${settings.dir}${settings.files.eslintIssues}`);
  } catch {
    // It always has a non-zero exit code
  }
};
