import { loadConfig } from "c12";
import { RuinsConfig } from "~/types/config";

export const getConfig = async () => {
  const cwdFromNpm = process.cwd().replace(/\/api/, "");
  const { config } = await loadConfig<RuinsConfig>({
    cwd: cwdFromNpm,
    configFile: "ruins.config.js",
  });
  return config;
};
