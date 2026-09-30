import type { RuinsCommitsOutput } from "./types.js";

const getGroupedRows = (data: RuinsCommitsOutput, getKey: (entry: RuinsCommitsOutput["data"][number]) => string) => {
  const totals = new Map<string, number>();
  for (const entry of data?.data ?? []) {
    const key = getKey(entry);
    totals.set(key, (totals.get(key) ?? 0) + 1);
  }
  return [...totals]
    .map(([name, total]) => ({ name, total }))
    .sort((left, right) => right.total - left.total);
};

export const getScopeRows = (data: RuinsCommitsOutput) =>
  getGroupedRows(data, (entry) => entry.meta?.scope ?? "no-scope");

export const getTypeRows = (data: RuinsCommitsOutput) =>
  getGroupedRows(data, (entry) => entry.meta?.type ?? "no-type");
