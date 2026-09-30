// this is a stripped down version of RuinsModule
// importing it directly creates ts issues
export interface RuinsModuleSimplified {
  meta: {
    name: string;
    description: string;
    /** File where the information is stored, inside ./ruins folder */
    file?: string;
  };
  ui?: {
    name: string;
    icon?: string;
    views?: {
      name: string;
      label?: string;
      columns: { name: string }[];
    }[];
  };
}

export type UiDataPanel = Record<string, number | string | boolean | undefined | null>[];
