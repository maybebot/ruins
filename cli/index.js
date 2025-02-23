import { consola } from "consola";
import { createLintFile } from "./create-lint-file.js";
import { openDashboard } from "./open-dashboard.js";
import path from "path";

const ruinsDir = path.resolve(import.meta.url, "..");

/**
 * Ruins CLI
 *
 * @returns {Promise<void>}
 */
export const cli = async () => {
  consola.start("Preparing Ruins.");
  const action = await consola.prompt("Ruins up and running", {
    type: "select",
    options: [
      {
        label: "Open Dashboard",
        value: "dashboard",
        hint: "Open a dashboard in the browser with linting errors state",
      },
      {
        label: "Re-run linting",
        value: "relint",
        hint: "Collect all eslint errors of the project in a file",
      },
      {
        label: "Add eslint errors to ignore",
        value: "add-eslint-ignore",
        hint: "Collect all eslint errors of the project in a file",
      },
    ],
  });
  switch (action) {
    case "relint":
      createLintFile(ruinsDir);
      break;
    case "add-eslint-ignore":
      addEslintIgnore();
      break;
    case "dashboard":
    default:
      openDashboard(ruinsDir);
      break;
  }
};
