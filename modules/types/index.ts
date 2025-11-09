/**
 * A module is a a plugin that adds functionality to ruins.
 */
export type RuinsModule = {
  config: {
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
      action: (outputFile: string) => Promise<void>;
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
};
