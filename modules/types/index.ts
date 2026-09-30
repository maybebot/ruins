import type { RuinsConfigInternal } from "@ruins/config";

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
      getAction: (config: RuinsConfigInternal) => () => void | Promise<void>;
      /** If true, can be run with --run flag. False for processes like opening dashboard */
      runnable?: boolean;
    }[];
  };
  ui?: {
    name: string;
    icon?: string;
    views?: UiDataPanel[];
  };
  settings?: ModuleSpecificSettings;
}

export interface UiTransformContext {
  config: RuinsConfigInternal;
  query: Record<string, string>;
}

export type UiDataRow = Record<string, number | string | boolean | undefined | null>;

export interface UiDataPanel {
  name: string;
  label?: string;
  file: string;
  columns: Array<{ name: string }>;
  transformerFn: (data: any, context?: UiTransformContext) => UiDataRow[];
}
