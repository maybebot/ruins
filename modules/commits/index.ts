import type { RuinsModule } from "@ruins/types";
import { getGitlogData } from "./transformers/collect.js";
import { getScopeRows, getTypeRows } from "./transformers/rows.js";

export interface CommitSettings {
  /** how many months of git history to scan */
  months: 1 | 2 | 3 | 4 | 5 | 6;
}

const defaultSettings: CommitSettings = {
  months: 3,
};

export const commits = (userSettings?: CommitSettings): RuinsModule => {
  const settings: CommitSettings = {
    ...defaultSettings,
    ...userSettings,
  };

  return {
    meta: {
      name: "commits",
      description: "Scans and analyses conventional commits",
    },
    ui: {
      name: "Commits",
      icon: "compass",
      views: [
        {
          name: "default",
          label: "Scope",
          columns: [{ name: "name" }, { name: "total" }],
          getData: () => getGitlogData(settings.months),
          transformerFn: getScopeRows,
        },
        {
          name: "type",
          label: "Type",
          columns: [{ name: "name" }, { name: "total" }],
          getData: () => getGitlogData(settings.months),
          transformerFn: getTypeRows,
        },
      ],
    },
    settings,
  };
};

