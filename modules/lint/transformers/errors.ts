import { EslintIgnoreByFile, RuinsEslintOutput } from "./types.js";
import { basename } from "node:path";

/** Transforms ruins issues into eslint-compatible ignores js object */
export const transformIntoLintIgnores = (
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
