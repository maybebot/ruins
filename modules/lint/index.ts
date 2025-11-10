import { RuinsModule } from "@ruins/types";
import { collectLintErrors } from "./cmd/collect-lint-errors.js";
import { readConfig, RuinsConfigInternal } from "@ruins/config";

export interface LintSettings {
  /** turns ignored from error to off, instead of default warn */
  preferOff: boolean;
}

const defaultSettings: LintSettings = {
  preferOff: false,
};

const makeLintModule: (
  s: LintSettings,
  config: RuinsConfigInternal
) => RuinsModule<LintSettings> = (settings: LintSettings, config: RuinsConfigInternal) => ({
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
        action: collectLintErrors(settings, config),
      },
    ],
  },
  settings: settings,
});

export const lint = async (
  userSettings?: Partial<LintSettings>
): Promise<RuinsModule<LintSettings>> => {
  const config = await readConfig();

  const settings: LintSettings = {
    ...defaultSettings,
    ...userSettings,
  };

  return makeLintModule(settings, config);
};
