import { consola } from "consola";
import { createLintFile } from "./create-lint-file.js";
import { addEslintIgnore } from "./add-eslint-ignore.js";
import { openDashboard } from "./open-dashboard.js";
import path from "path";

/**
 * Ruins CLI
 */
export const cli = async () => {
  const ruinsPath = path.resolve(process.cwd(), "node_modules", "ruins");
  const binPath = path.resolve(process.cwd(), "node_modules", ".bin");
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
        label: "[eslint] Collect errors",
        value: "eslint-collect",
        hint: "Collect all eslint errors of the project on a file per file basis.",
      },
      {
        label: "[eslint] Create ignores",
        value: "eslint-ignore",
        hint: "Disables collected errors for the file where they are used.",
      },
    ],
  });
  switch (action) {
    case "dashboard":
      openDashboard(ruinsPath, binPath);
      break;
    case "eslint-collect":
      createLintFile(ruinsPath, binPath);
      break;
    case "eslint-ignore":
      addEslintIgnore();
      break;
  }
};
