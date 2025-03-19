import { consola } from "consola";
import { createLintFile } from "./create-lint-file.js";
import { addEslintIgnore } from "./add-eslint-ignore.js";
import { openDashboard } from "./open-dashboard.js";
import path from "path";

const ruinsDir = path.resolve(import.meta.dirname, "..");

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
        label: "Collect linting errors",
        value: "relint",
        hint: "Collect all eslint errors of the project on a file per file basis.",
      },
      {
        label: "Disable existing linting errors",
        value: "add-eslint-ignore",
        hint: "Disables collected errors for the file where they are used.",
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
