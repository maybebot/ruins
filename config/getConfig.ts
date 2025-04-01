import { loadConfig } from "c12";

const baseConfig: RuinsConfig = {
  /** directory where ruins files are generated */
  dir: ".ruins/",
  eslint: {
    preferOff: false,
    filenameOnly: false,
  },
  gitlog: {
    months: 3,
  },
};

const staticConfig = {
  files: {
    eslintIssues: "eslint-issues.json",
    eslintIgnores: "eslint-ignores.js",
    todos: "todos.json",
    gitlog: "gitlog.json",
  },
};

export const getConfig = async () => {
  const cwdFromNpm = process.cwd().replace(/\/api/, "");
  const { config } = await loadConfig<RuinsConfig>({
    cwd: cwdFromNpm,
    configFile: "ruins.config.js",
  });
  return {
    ...staticConfig,
    ...baseConfig,
    ...config,
    eslint: { ...config?.eslint },
  };
};

export interface RuinsConfig {
  dir: string;
  eslint: {
    /** turns ignored from error to off, instead of default warn */
    preferOff: boolean;
    /** identify files by filename only, not path. Inaccurate, useful only if making big directory changes */
    filenameOnly: boolean;
  };
  group?: {
    dirs: string[];
  };
  gitlog: {
    months: 1 | 2 | 3 | 4 | 5 | 6;
  };
}
