import { loadConfig } from "c12";
import { getConfig } from "./getConfig.js";
import type { RuinsOutput, RuinsGitlog } from "../types/ruins.js";
import { resolve } from "node:path";

export const getGitlog = async () => {
  const settings = await getConfig();
  // TODO: fix this path stuff
  const cwdFromNpm = process.cwd().replace(/\/api/, "");

  const { config } = await loadConfig<RuinsOutput<RuinsGitlog>>({
    cwd: resolve(cwdFromNpm, settings.dir),
    configFile: settings.files.gitlog,
  });
  return config;
};
