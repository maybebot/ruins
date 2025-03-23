import path from "path";
import { execSync } from "child_process";

/**
 * Create a lint file
 *
 * @param {string} ruinsPath - path to Ruins project directory
 * @returns {Promise<void>}
 */
export const createLintFile = async (ruinsPath: string, binPath: string) => {
  await execSync('touch "lint-ruins.json"');

  try {
    await execSync(
      `${binPath}/eslint -o ./lint-ruins.json -f ${ruinsPath}/dist/cli/utils/format.js`
    );
  } catch {
    // It always has a non-zero exit code
  }
};
