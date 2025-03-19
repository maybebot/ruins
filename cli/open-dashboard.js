import consola from "consola";
import path from "path";
import { exec } from "child_process";

/**
 * Opens the dashboard in the browser
 *
 * @param {string} ruinsPath - path to Ruins project directory
 * @returns {Promise<void>}
 */
export const openDashboard = async (ruinsPath) => {
  consola.start("Preparing dashboard");
  await exec(`node ${ruinsPath}/.output/server/index.mjs`);
  const binPath = path.resolve(process.cwd(), "node_modules", ".bin");
  await exec(`${binPath}/http-server -p 4848 ${ruinsPath}/ui/dist/`);
  console.log(`${binPath}/http-server -p 4848 ${ruinsPath}/ui/dist/`);
  consola.box("Dashboard available on http://localhost:4848");
};
