import { loadConfig } from "c12";
import type { RuinsConfig, RuinsConfigInternal } from "@ruins/types";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

export type { RuinsConfig, RuinsConfigInternal } from "@ruins/types";

/**
 * Definition of Ruins config in user's /ruins.config.ts file
 */
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
