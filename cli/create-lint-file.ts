import { execSync } from "child_process";
import { getConfig } from "../config/getConfig.js";
import { resolve } from "node:path";

/**
 * Create a lint file
 *
 * @param {string} ruinsPath - path to Ruins project directory
 * @returns {Promise<void>}
 */
export const createLintFile = async (ruinsPath: string, binPath: string) => {
  const settings = await getConfig();
  const outputFile = resolve(settings.dir, settings.files.eslintIssues);

  try {
    await execSync(
      `${binPath}/eslint -o ${outputFile} -f ${ruinsPath}/dist/cli/formatters/output.js`
    );
  } catch {
    // It always has a non-zero exit code
  }
};
