import { loadConfig } from "c12";
import { RuinsConfig } from "~/types/config";

export const getConfig = async () => {
  const { config } = await loadConfig<RuinsConfig>({
    configFile: "ruins.config.js",
  });
  return config;
};
