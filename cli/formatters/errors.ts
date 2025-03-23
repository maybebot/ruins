import { EslintIgnoreByFile, RuinsEslintOutput } from "../../types/eslint.js";

export const getEslintIgnoreByFile = (
  input: RuinsEslintOutput
): EslintIgnoreByFile => {
  return input.issues.map((issue) => ({
    files: [issue.filePath],
    rules: issue.messages.reduce((acc, message) => {
      acc[message.ruleId] = "off";
      return acc;
    }, {} as Record<string, "off" | "warn">),
  }));
};
