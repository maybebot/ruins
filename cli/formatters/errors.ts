import { EslintIgnoreByFile, RuinsEslintOutput } from "../../types/eslint.js";

export const getEslintIgnoreByFile = (
  input: RuinsEslintOutput,
  preferOff: boolean
): EslintIgnoreByFile => {
  return input.issues.map((issue) => ({
    files: [issue.filePath],
    rules: issue.messages.reduce((acc, message) => {
      acc[message.ruleId] = preferOff ? "off" : "warn";
      return acc;
    }, {} as Record<string, "off" | "warn">),
  }));
};
