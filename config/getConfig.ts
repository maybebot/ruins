import { loadConfig } from "c12";

const baseConfig: RuinsConfig = {
  /** directory where ruins files are generated */
  dir: ".ruins/",
  eslint: {
    enabled: true,
    preferOff: false,
    filenameOnly: false,
  },
  todos: {
    enabled: true,
  },
  gitlog: {
    enabled: true,
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
    configFile: "ruins.config",
  });
  return {
    ...staticConfig,
    ...baseConfig,
    ...config,
    eslint: { ...baseConfig.eslint, ...config?.eslint },
    todos: { ...baseConfig.todos, ...config?.todos },
    gitlog: { ...baseConfig.gitlog, ...config?.gitlog },
  };
};

export interface RuinsConfig {
  dir: string;
  eslint: {
    enabled: boolean;
    /** turns ignored from error to off, instead of default warn */
    preferOff: boolean;
    /** identify files by filename only, not path. Inaccurate, useful only if making big directory changes */
    filenameOnly: boolean;
  };
  group?: {
    dirs: string[];
  };
  todos: {
    enabled: boolean;
  };
  gitlog: {
    enabled: boolean;
    months: 1 | 2 | 3 | 4 | 5 | 6;
  };
  customCommands?: CustomCommand[];
}

export interface CustomCommand {
  name: string;
  type: "occurance" | "filename";
  regex: string;
  label: string;
  hint?: string;
}

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
export type UserRuinsConfig = DeepPartial<RuinsConfig>;
