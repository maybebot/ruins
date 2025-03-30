import consola from "consola";
import { exec } from "child_process";

/**
 * Opens the dashboard in the browser
 *
 * @param {string} ruinsPath - path to Ruins project directory
 * @returns {Promise<void>}
 */
export const openDashboard = async (ruinsPath: string, binPath: string) => {
  consola.start("Preparing dashboard");
  await exec(`node ${ruinsPath}/api/.output/server/index.mjs`);
  await exec(`${binPath}/http-server -p 4848 ${ruinsPath}/ui/dist/`);
  consola.box("Dashboard available on http://localhost:4848");
};
