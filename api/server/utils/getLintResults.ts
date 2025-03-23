import { loadConfig } from "c12";
import { RuinsEslintOutput } from "../../../types/eslint";

export const getLintResults = async () => {
  // TODO: fix this path stuff
  const cwdFromNpm = process.cwd().replace(/\/api/, "");

  const { config } = await loadConfig<RuinsEslintOutput>({
    cwd: cwdFromNpm,
    configFile: "lint-ruins.json",
  });
  return config;
};
