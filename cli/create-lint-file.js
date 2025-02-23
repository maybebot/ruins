import path from "path";
import { execSync } from "child_process";

/**
 * Create a lint file
 *
 * @param {string} ruinsPath - path to Ruins project directory
 * @returns {Promise<void>}
 */
export const createLintFile = async (ruinsPath) => {
  await execSync('touch "lint-ruins.json"');

  try {
    const binPath = path.resolve(process.cwd(), "node_modules", ".bin");
    await execSync(
      `${binPath}/eslint -o ./lint-ruins.json -f ${ruinsPath}/utils/format.js`
    );
  } catch {
    // It always has a non-zero exit code
  }
};
