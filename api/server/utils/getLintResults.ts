import { loadConfig } from "c12";
import { EslintOutput } from "~/types/eslint";

export const getLintResults = async () => {
  const { config } = await loadConfig<{ issues: EslintOutput[] }>({
    configFile: "lint-ruins.json",
  });
  return config;
};
