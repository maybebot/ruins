import { loadConfig } from "c12";

export const getConfig = async () => {
  const cwdFromNpm = process.cwd().replace(/\/api/, "");
  const { config } = await loadConfig<RuinsConfig>({
    cwd: cwdFromNpm,
    configFile: "ruins.config.js",
  });
  return config;
};

export interface RuinsConfig {
  group: {
    dirs: string[];
  };
}
