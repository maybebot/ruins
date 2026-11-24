import { loadConfig } from "c12";
import type { RuinsModule } from "@ruins/types";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Definition of Ruins config in user's /ruins.config.ts file
 */
export interface RuinsConfig {
  /** Directory where ruins files are stored. Do not .gitignore */
  dir: string;
  /** Snapshot storage and Git history settings. */
  snapshots?: {
    /** Number of completed weeks to generate, from 1 to 5200 (default 26). */
    historyWeeks?: number;
    /** Snapshot directory relative to dir, or an absolute path (default "snapshots"). */
    directory?: string;
  };
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
    cwd: string;
    ruinsDir: string;
    ruins: string;
    bin: string;
  };
}

const defaultConfig = Object.freeze({
  dir: ".ruins/",
  modules: [],
});

const resolveRuinsRoot = () => {
  let directory = dirname(fileURLToPath(import.meta.url));
  while (true) {
    try {
      const manifest = JSON.parse(readFileSync(resolve(directory, "package.json"), "utf8")) as {
        name?: string;
      };
      if (manifest.name === "ruins") return directory;
    } catch (error) {
      if (!(error instanceof Error && "code" in error && error.code === "ENOENT")) throw error;
    }

    const parent = dirname(directory);
    if (parent === directory) throw new Error("Could not locate the installed ruins package.");
    directory = parent;
  }
};

/** Returns user configuration in ruins.config.ts */
export const readConfig = async (): Promise<RuinsConfigInternal> => readConfigAt(process.cwd());

export const readConfigAt = async (cwd: string): Promise<RuinsConfigInternal> => {
  const { config } = await loadConfig<RuinsConfig>({
    cwd,
    configFile: "ruins.config",
  });

  const mergedConfig: RuinsConfig = {
    ...defaultConfig,
    ...config,
  };

  const ruinsRoot = resolveRuinsRoot();

  const internalConfig: RuinsConfigInternal = {
    ...mergedConfig,
    _paths: {
      cwd,
      ruinsDir: resolve(cwd, mergedConfig.dir),
      ruins: ruinsRoot,
      bin: resolve(cwd, "node_modules", ".bin"),
    },
  };

  return internalConfig;
};
