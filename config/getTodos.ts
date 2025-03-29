import { loadConfig } from "c12";
import { getConfig } from "./getConfig.js";
import { RuinsTodos } from "../types/todos.js";
import type { RuinsOutput } from "../types/ruins.js";
import { resolve } from "node:path";

export const getTodos = async () => {
  const settings = await getConfig();
  // TODO: fix this path stuff
  const cwdFromNpm = process.cwd().replace(/\/api/, "");

  const { config } = await loadConfig<RuinsOutput<RuinsTodos>>({
    cwd: resolve(cwdFromNpm, settings.dir),
    configFile: settings.files.todos,
  });
  return config;
};
