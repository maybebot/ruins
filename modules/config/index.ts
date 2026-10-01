import { loadConfig } from "c12";
import type { RuinsModule } from "@ruins/types";
import { existsSync } from "node:fs";
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
    ruinsDir: string;
    ruins: string;
    bin: string;
  };
}

const defaultConfig = Object.freeze({
  dir: ".ruins/",
  modules: [],
});

const resolveRuinsRoot = (cwd: string) => {
  const localBuildOutput = resolve(cwd, "dist", ".output", "server", "index.mjs");
  if (existsSync(localBuildOutput)) {
    return cwd;
  }

  const installedPackageRoot = resolve(cwd, "node_modules", "ruins");
  const installedBuildOutput = resolve(
    installedPackageRoot,
    "dist",
    ".output",
    "server",
    "index.mjs",
  );
  if (existsSync(installedBuildOutput)) {
    return installedPackageRoot;
  }

  return installedPackageRoot;
};

/** Returns user configuration in ruins.config.ts */
export const readConfig = async (): Promise<RuinsConfigInternal> => {
  const { config } = await loadConfig<RuinsConfig>({
    cwd: process.cwd(),
    configFile: "ruins.config",
  });

  const mergedConfig: RuinsConfig = {
    ...defaultConfig,
    ...config,
  };

  const ruinsRoot = resolveRuinsRoot(process.cwd());

  const internalConfig: RuinsConfigInternal = {
    ...mergedConfig,
    _paths: {
      ruinsDir: resolve(process.cwd(), mergedConfig.dir),
      ruins: ruinsRoot,
      bin: resolve(process.cwd(), "node_modules", ".bin"),
    },
  };

  return internalConfig;
};
