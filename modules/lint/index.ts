import type { RuinsModule, UiTransformContext } from "@ruins/types";
import { collectLintErrors } from "./cmd/collect-lint-errors.js";
import type { RuinsConfigInternal } from "@ruins/config";
import type { RuinsEslintOutput } from "./transformers/types.js";

type IssueRow = { name: string; error: number; warning: number; total: number };

const getFileRows = (data: RuinsEslintOutput, context?: UiTransformContext): IssueRow[] => {
  const rows = (data?.issues ?? []).map((issue) => ({
    name: issue.filePath,
    error: issue.errorCount,
    warning: issue.warningCount,
    total: issue.errorCount + issue.warningCount,
  }));
  const requestedSort = context?.query.sortBy;
  const sortBy = requestedSort === "warning" || requestedSort === "total" ? requestedSort : "error";
  return rows.sort((left, right) => right[sortBy] - left[sortBy]);
};

const getGroupedRows = (data: RuinsEslintOutput, context?: UiTransformContext): IssueRow[] => {
  const fileRows = getFileRows(data, context);
  const directories = context?.config.group?.dirs ?? [];
  if (directories.length === 0) return fileRows;

  const groups = directories
    .map((directory) => {
      const files = fileRows.filter((file) => file.name.startsWith(directory));
      return {
        name: directory,
        error: files.reduce((total, file) => total + file.error, 0),
        warning: files.reduce((total, file) => total + file.warning, 0),
        total: files.reduce((total, file) => total + file.total, 0),
      };
    })
    .sort((left, right) => right.total - left.total);
  const groupedTotal = groups.reduce((total, group) => total + group.total, 0);
  const total = fileRows.reduce((sum, file) => sum + file.total, 0);
  const remaining = Math.max(0, total - groupedTotal);
  return remaining > 0
    ? [...groups, { name: "In other places", error: 0, warning: 0, total: remaining }]
    : groups;
};

const getRuleRows = (data: RuinsEslintOutput) => {
  const totals = new Map<string, number>();
  for (const issue of data?.issues ?? []) {
    for (const message of issue.messages) {
      const rule = message.ruleId ?? "no-rule";
      totals.set(rule, (totals.get(rule) ?? 0) + 1);
    }
  }
  return [...totals]
    .map(([name, total]) => ({ name, total }))
    .sort((left, right) => right.total - left.total);
};

const fileColumns = [{ name: "name" }, { name: "error" }, { name: "warning" }, { name: "total" }];

export interface LintSettings {
  /** turns ignored from error to off, instead of default warn */
  preferOff?: boolean;
  /** identify files by filename only, not path */
  filenameOnly?: boolean;
}

const defaultSettings: LintSettings = {
  preferOff: false,
  filenameOnly: false,
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
          getAction: (config: RuinsConfigInternal) => () => collectLintErrors(settings, config),
          runnable: true,
        },
      ],
    },
    ui: {
      name: "Lint",
      icon: "swords",
      views: [
        {
          name: "default",
          label: "Files",
          file: "lint-issues.json",
          columns: fileColumns,
          transformerFn: getFileRows,
        },
        {
          name: "grouped",
          label: "Grouped",
          file: "lint-issues.json",
          columns: fileColumns,
          transformerFn: getGroupedRows,
        },
        {
          name: "rules",
          label: "Rules",
          file: "lint-issues.json",
          columns: [{ name: "name" }, { name: "total" }],
          transformerFn: getRuleRows,
        },
      ],
    },
    settings,
  };
};
