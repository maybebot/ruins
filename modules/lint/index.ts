import { RuinsModule } from "@ruins/types";
import { collectLintErrors } from "./cmd/collect-lint-errors.js";
import { RuinsConfigInternal } from "@ruins/config";

export interface LintSettings {
  /** turns ignored from error to off, instead of default warn */
  preferOff?: boolean;
}

const defaultSettings: LintSettings = {
  preferOff: false,
};

export const lint = (userSettings?: LintSettings): RuinsModule => {
  const settings: LintSettings = {
    ...defaultSettings,
    ...userSettings,
  };

  return {
    meta: {
      name: "lint",
      description: "for granular linting",
    },
    cli: {
      commands: [
        {
          value: "collect-lint-errors",
          label: "Collect lint errors",
          hint: "Collect existing lint errors, enables downgrade to warnings or analysis.",
          getAction: (config: RuinsConfigInternal) => collectLintErrors(settings, config),
          runnable: true,
        },
      ],
    },
    ui: {
      name: "Lint",
      icon: "pickaxe",
      views: [
        {
          name: "default",
          processFn: (data: any) => data,
        },
      ],
    },
    settings: settings,
  };
};
