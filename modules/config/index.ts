import { RuinsModule } from "@ruins/types";
import type { RuinsConfig } from "./types";
import { loadConfig } from "c12";

export { RuinsConfig } from "./types";

export const ruinsModule: RuinsModule = {
  config: {
    name: "config",
    description: "[internal] module for loading ruins.config",
  },
};

/** Returns user configuration in ruins.config.ts */
export const readConfig = async () => {
  const { config } = await loadConfig<RuinsConfig>({
    cwd: process.cwd(),
    configFile: "ruins.config",
  });
  return config;
};
