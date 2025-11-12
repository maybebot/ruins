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
      const hasValidRunFlag = args.run && commands.find((c) => c.value === args.run && c.runnable);
      if (hasValidRunFlag) {
        action = args.run;
        consola.info(`Found --run ${args.run}, running command without prompt...`);
      } else {
        action = await consola.prompt("Ruins up and running", {
          type: "select",
          options: commands,
        });
      }

      const selectedCommand = commands.find((c) => c.value === action)!;
      const selectedAction = selectedCommand!.getAction(config);
      await selectedAction();
      if (!hasValidRunFlag) {
        cli();
      }
    },
  });
};

const openDashboard = async (ruinsPath: string) => {
  consola.start("Preparing dashboard");
  // await exec(`PORT=4848 node ./dist/.output/server/index.mjs`);
  await exec(`PORT=4848 node ${ruinsPath}/dist/.output/server/index.mjs`);
  console.log(ruinsPath);
  // await exec(`${binPath}/http-server -p 4848 ${ruinsPath}/ui/dist/`);
  consola.box("Dashboard available on http://localhost:4848");
};
const uiCommand = {
  label: "Open Dashboard",
  value: "dashboard",
  hint: "Open a dashboard in the browser with linting errors state",
  runnable: false,
  getAction: (config: RuinsConfigInternal) => () => openDashboard(config._paths.ruins),
};
