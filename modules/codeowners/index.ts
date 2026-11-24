import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { RuinsModule, UiTransformContext } from "@ruins/types";
import { getOwners, loadCodeowners, toRepositoryPath } from "./owners.js";

type Issue = { filePath: string; errorCount: number; warningCount: number };
type IssueData = { issues: Issue[] };
type Row = { name: string; error: number; warning: number; total: number };
type OwnedIssue = { issue: Issue; owners: string[] };

const unowned = "Unowned";

const getData = async (context: UiTransformContext): Promise<OwnedIssue[]> => {
  const cwd = context.config._paths.cwd;
  const [codeowners, content] = await Promise.all([
    loadCodeowners(cwd),
    readFile(resolve(context.config._paths.ruinsDir, "lint-issues.json"), "utf8"),
  ]);
  const data = JSON.parse(content) as IssueData;
  return data.issues.map((issue) => ({
    issue,
    owners: getOwners(codeowners.rules, toRepositoryPath(codeowners.root, cwd, issue.filePath)),
  }));
};

export const getOwnerRows = (data: OwnedIssue[], context?: UiTransformContext): Row[] => {
  const selectedOwner = context?.query.owner;
  const rows = new Map<string, Row>();
  for (const { issue, owners } of data) {
    const groups = owners.length ? [...new Set(owners)] : [unowned];
    if (selectedOwner !== undefined && !groups.includes(selectedOwner)) continue;
    for (const name of selectedOwner !== undefined ? [issue.filePath] : groups) {
      const row = rows.get(name) ?? { name, error: 0, warning: 0, total: 0 };
      row.error += issue.errorCount;
      row.warning += issue.warningCount;
      row.total += issue.errorCount + issue.warningCount;
      rows.set(name, row);
    }
  }
  return [...rows.values()].sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));
};

export const codeowners = (): RuinsModule => ({
  meta: {
    name: "codeowners",
    description: "Groups lint issues by CODEOWNERS",
  },
  uiViews: {
    module: "lint",
    views: [
      {
        name: "owners",
        label: "Owners",
        drilldown: {
          query: "owner",
          backLabel: "owners",
          note: "Files with multiple owners are counted for each owner.",
        },
        columns: [{ name: "name" }, { name: "error" }, { name: "warning" }, { name: "total" }],
        getData,
        transformerFn: getOwnerRows,
      },
    ],
  },
});
