import { EslintIgnoreByFile, RuinsEslintOutput } from "../../types/eslint.js";
import { basename } from "node:path";

export const getEslintIgnoreByFile = (
  input: RuinsEslintOutput,
  preferOff: boolean,
  filenameOnly: boolean
): EslintIgnoreByFile => {
  return input.issues.map((issue) => ({
    files: [filenameOnly ? basename(issue.filePath) : issue.filePath],
    rules: issue.messages.reduce((acc, message) => {
      acc[message.ruleId] = preferOff ? "off" : "warn";
      return acc;
    }, {} as Record<string, "off" | "warn">),
  }));
};
