import { consola } from "consola";
import { createLintFile } from "./create-lint-file.js";
import { addEslintIgnore } from "./add-eslint-ignore.js";
import { openDashboard } from "./open-dashboard.js";
import { createTodoFile } from "./create-todo-file.js";
import { createGitLog } from "./create-git-log.js";
import path from "path";

/**
 * Ruins CLI
 */
export const cli = async () => {
  const ruinsPath = path.resolve(process.cwd(), "node_modules", "ruins");
  const binPath = path.resolve(process.cwd(), "node_modules", ".bin");
  consola.start("Preparing Ruins.");
  prompt(ruinsPath, binPath);
};

const prompt = async (ruinsPath: string, binPath: string) => {
  const rePrompt = () => setTimeout(() => prompt(ruinsPath, binPath), 600);
  const action = await consola.prompt("Ruins up and running", {
    type: "select",
    options: [
      {
        label: "Open Dashboard",
        value: "dashboard",
        hint: "Open a dashboard in the browser with linting errors state",
      },
      {
        label: "[eslint] Collect linting errors",
        value: "eslint-collect-ignore",
        hint: "Collect project errors, create issues and ignore file",
      },
      {
        label: "(beta)[todos] Collect TODOs",
        value: "todo-collect",
        hint: "Collect all TODOs found in the project on a file per file basis.",
      },
      {
        label: "(alpha)[git] Collect conventional commits",
        value: "git-log-collect",
        hint: "Collect recent git conventional commits for analysis, 3 months by default",
      },
    ],
  });
  switch (action) {
    case "dashboard":
      await openDashboard(ruinsPath, binPath);
      rePrompt();
      break;
    case "eslint-collect-ignore":
      await createLintFile(ruinsPath, binPath);
      await addEslintIgnore();
      rePrompt();
      break;
    case "todo-collect":
      await createTodoFile();
      rePrompt();
      break;
    case "git-log-collect":
      await createGitLog();
      rePrompt();
      break;
  }
};
