import { RuinsModule } from "@ruins/types";
import { RuinsConfigInternal } from "@ruins/config";
import { scanCommits } from "./cmd/scan.js";

export interface CommitSettings {
  /** turns ignored from error to off, instead of default warn */
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
    cli: {
      commands: [
        {
          value: "scan-commits",
          label: "Scans conventional commmits",
          hint: "Analyses conventional commits and aggregates scopes, types, etc.",
          getAction: (config: RuinsConfigInternal) => () => scanCommits(settings, config),
          runnable: true,
        },
      ],
    },
    ui: {
      name: "Commits",
      icon: "compass",
      views: [
        {
          name: "default",
          processFn: (data: any) => data,
        },
      ],
    },
    settings,
  };
};
