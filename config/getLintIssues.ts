import { loadConfig } from "c12";
import { getConfig } from "./getConfig.js";
import { RuinsEslintOutput } from "../types/eslint.js";
import { resolve } from "node:path";

export const getLintIssues = async () => {
  const settings = await getConfig();
  // TODO: fix this path stuff
  const cwdFromNpm = process.cwd().replace(/\/api/, "");

  const { config } = await loadConfig<RuinsEslintOutput>({
    cwd: resolve(cwdFromNpm, settings.dir),
    configFile: settings.files.eslintIssues,
  });
  return config;
};
