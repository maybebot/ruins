import { getConfig } from "../config/getConfig.js";
import { customOccurances } from "./custom-occurances.js";

export const getCustomCommands = async () => {
  const config = await getConfig();
  if (!config.customCommands) return [];

  // type: occurances
  return config.customCommands.map((command) => ({
    value: command.name,
    label: `[custom] ${command.label}`,
    hint: command.hint ?? "",
    exec: () => customOccurances(command.regex, command.name),
  }));
};
