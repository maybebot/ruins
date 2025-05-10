import { loadConfig } from "c12";
import { getConfig } from "./getConfig.js";
import type { RuinsOutput, RuinsCommits } from "../types/ruins.js";
import { resolve } from "node:path";

export const getCommits = async () => {
  const settings = await getConfig();
  // TODO: fix this path stuff
  const cwdFromNpm = process.cwd().replace(/\/api/, "");

  const { config } = await loadConfig<RuinsOutput<RuinsCommits>>({
    cwd: resolve(cwdFromNpm, settings.dir),
    configFile: settings.files.commits,
  });
  return config;
};
