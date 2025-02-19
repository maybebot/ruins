#!/usr/bin/env node

"use strict";

import { consola } from "consola";
import path from "path";
import { exec, execSync } from "child_process";

const createLintFile = async () => {
  await execSync('touch "lint-ruins.json"');

  try {
    const binPath = path.resolve(process.cwd(), "node_modules", ".bin");
    const currentPath = import.meta.dirname;
    await execSync(
      `${binPath}/eslint -o ./lint-ruins.json -f ${currentPath}/utils/format.js`
    );
  } catch {
    // It always has a non-zero exit code
  }
};

const openDashboard = async () => {
  consola.start("Preparing dashboard");
  const currentPath = import.meta.dirname;
  await exec(`node ${currentPath}/.output/server/index.mjs`);
  const binPath = path.resolve(process.cwd(), "node_modules", ".bin");
  await exec(`${binPath}/http-server -p 4848 ${currentPath}/dist`);
  consola.box("Dashboard available on http://localhost:4848");
};

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
    ],
    initial: "TypeScript",
  });
  switch (action) {
    case "relint":
      createLintFile();
      break;
    case "dashboard":
    default:
      openDashboard();
      break;
  }
};

cli();
