import { loadConfig } from "c12";
import { RuinsModule } from "@ruins/types";
import { resolve } from "node:path";

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
  modules: RuinsModule[];
}

/** Config with paths for internal use only */
export interface RuinsConfigInternal extends RuinsConfig {
  _paths: {
    ruins: string;
    bin: string;
  };
}

const defaultConfig = Object.freeze({
  dir: ".ruins/",
});

/** Returns user configuration in ruins.config.ts */
export const readConfig = async (): Promise<RuinsConfigInternal> => {
  const { config } = await loadConfig<RuinsConfig>({
    cwd: process.cwd(),
    configFile: "ruins.config",
  });

  const internalConfig: RuinsConfigInternal = {
    ...defaultConfig,
    ...config,
    _paths: {
      ruins: resolve(process.cwd(), "node_modules", "ruins"),
      bin: resolve(process.cwd(), "node_modules", ".bin"),
    },
  };

  return internalConfig;
};
