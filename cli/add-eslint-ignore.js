import path from "path";
import { execSync } from "child_process";

/**
 * Adds all errors found to the ignore file
 *
 * @param {string} ruinsPath - path to Ruins project directory
 * @returns {Promise<void>}
 */
export const addEslintIgnore = async (ruinsPath) => {
  await execSync('touch "lint-ruins.json"');

  try {
    const binPath = path.resolve(process.cwd(), "node_modules", ".bin");
    await execSync(
      `${binPath}/eslint -o ./lint-ruins.json --quiet -f ${ruinsPath}/cli/utils/errors.js`
    );
  } catch {
    // It always has a non-zero exit code
  }
};
