import { loadConfig } from "c12";
import { RuinsModule } from "@ruins/types";

/**
 * Definition of Ruins config in user's /ruins.config.ts file
 */
export interface RuinsConfig {
  /** Directory where ruins files are stored. Do not .gitignore */
  dir: string;
  /** Paths in your app to directories you want to show grouped results */
  group?: {
    dirs: string[];
  };
  /** Module-specific configuration */
  modules: Promise<RuinsModule>[];
}

/** Returns user configuration in ruins.config.ts */
export const readConfig = async () => {
  const { config } = await loadConfig<RuinsConfig>({
    cwd: process.cwd(),
    configFile: "ruins.config",
  });
  return config;
};
