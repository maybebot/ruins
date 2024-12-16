#!/usr/bin/env node

"use strict";

import { consola } from "consola";
import { exec, execSync } from "child_process";

const createLintFile = async () => {
  await execSync('touch "ruins-lint.json"');

  try {
    await execSync(
      "./node_modules/.bin/eslint -o ./ruins-lint.json -f ./node_modules/ruins/cli/json.js"
    );
  } catch {
    // It always has a non-zero exit code
  }
};

const openDashboard = async () => {
  consola.start("Preparing dashboard");
  await exec("node ./node_modules/ruins/.output/server/index.mjs");
  consola.box("Dashboard available on http://localhost:3000");
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
