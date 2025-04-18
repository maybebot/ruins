import { getConfig } from "../config/getConfig.js";
import { customOccurances } from "./custom-occurances.js";
import { customFilenames } from "./custom-filenames.js";

export const getCustomCommands = async () => {
  const config = await getConfig();
  if (!config.customCommands) return [];

  const fnMap = {
    filename: customFilenames,
    occurance: customOccurances,
  };

  return config.customCommands.map((command) => ({
    value: command.name,
    label: `[custom] ${command.label}`,
    hint: command.hint ?? "",
    exec: () => fnMap[command.type](command.regex, command.name),
  }));
};
