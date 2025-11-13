import { runMain } from "citty";
import { consola } from "consola";
import { readConfig, RuinsConfigInternal } from "@ruins/config";
import { exec } from "child_process";

export const cli = async () => {
  consola.start("Preparing Ruins.");
  const config = await readConfig();

  /**
   * CLI for running commands, defaults to prompting options
   * Allows for --run flag to run directly the available command (CI/CD friendly)
   */
  await runMain({
    args: {
      run: {
        type: "string",
        description: "Execute a command directly",
        required: false,
      },
    },
    async run({ args }) {
      const moduleCommands = config.modules.flatMap((module) => {
        return module?.cli?.commands ?? [];
      });

      const commands = [...moduleCommands, uiCommand];

      let action;
      const validFlags = commands.filter((cmd) => cmd.runnable).map((cmd) => cmd.value);
      const hasValidRunFlag = validFlags.includes(args.run);
      if (hasValidRunFlag) {
        action = args.run;
        consola.info(`Found --run ${args.run}, running command without prompt...`);
      } else if (typeof args.run === "string") {
        consola.error(`Provided an invalid --run flag: "${args.run}"`);
        consola.info(`Valid flags are: ${validFlags.join(",")}`);
        return;
      } else {
        action = await consola.prompt("Ruins up and running", {
          type: "select",
          options: commands,
        });
      }

      const selectedCommand = commands.find((c) => c.value === action);
      if (!selectedCommand) {
        // user might exit/ctrl+c
        return;
      }
      const selectedAction = selectedCommand.getAction(config);
      await selectedAction();
      if (!hasValidRunFlag) {
        // no reprompting run --run commands, facilitate CI/CDs
        cli();
      }
    },
  });
};

const openDashboard = async (ruinsPath: string) => {
  const port = "4848";
  consola.start("Preparing dashboard");
  await exec(`PORT=${port} node ${ruinsPath}/dist/.output/server/index.mjs`);
  consola.box(`Dashboard available on http://localhost:${port}`);
};
const uiCommand = {
  label: "Open Dashboard",
  value: "dashboard",
  hint: "Open a dashboard in the browser with linting errors state",
  runnable: false,
  getAction: (config: RuinsConfigInternal) => () => openDashboard(config._paths.ruins),
};
