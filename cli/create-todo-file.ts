import { execSync } from "child_process";
import { getConfig } from "../config/getConfig.js";
import { resolve } from "node:path";

/**
 * Create a file collecting all TODOs in the project
 *
 * @param {string} ruinsPath - path to Ruins project directory
 * @returns {Promise<void>}
 */
export const createTodoFile = async (ruinsPath: string) => {
  const settings = await getConfig();
  const outputFile = resolve(settings.dir, settings.files.todos);

  try {
    await execSync(`${ruinsPath}/dist/collect-todo ./ ${outputFile}`);
  } catch {
    // It always has a non-zero exit code
  }
};
