import { RuinsConfigInternal } from "@ruins/config";

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
      getAction: (config: RuinsConfigInternal) => () => void;
      /** If true, can be run with --run flag. False for processes like opening dashboard */
      runnable?: boolean;
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
