import type { RuinsConfig } from "@ruins/config";

/**
 * A module is a a plugin that adds functionality to ruins.
 */
export interface RuinsModule<ModuleSpecificSettings = {}> {
  meta: {
    name: string;
    description: string;
    /** File where the information is stored, inside ./ruins folder */
    file?: string;
  };
  cli?: {
    /** Array of commands that can be run in the ruins cli */
    commands: {
      label: string;
      value: string;
      hint: string;
      action: (settings: ModuleSpecificSettings, config?: RuinsConfig) => void;
    }[];
  };
  ui?: {
    name: string;
    icon?: string;
    views?: {
      name: string;
      processFn?: (data: any) => any[];
    }[];
  };
  settings?: ModuleSpecificSettings;
}
