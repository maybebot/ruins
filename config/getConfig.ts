import { loadConfig } from "c12";

const baseConfig: RuinsConfig = {
  /** directory where ruins files are generated */
  dir: ".ruins/",
  eslint: {
    /** turns ignored from error to off, instead of default warn */
    preferOff: false,
  },
};

const staticConfig = {
  files: {
    eslintIssues: "eslint-issues.json",
    eslintIgnores: "eslint-ignores.js",
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
    preferOff: boolean;
  };
  group?: {
    dirs: string[];
  };
}
