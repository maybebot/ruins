import type { RuinsSnapshotHistoryEntry } from "@ruins/snapshots/types";

export interface HistoryPoint {
  id: string;
  asOf: string;
  description: string;
  values: Map<string, number> | null;
  error?: string;
}

export const getHistoryData = (
  snapshots: RuinsSnapshotHistoryEntry[],
  moduleName: string,
  viewName: string,
): { points: HistoryPoint[]; categories: string[] } => {
  const categories = new Set<string>();
  const points = [...snapshots]
    .sort((left, right) => left.asOf.localeCompare(right.asOf) || left.id.localeCompare(right.id))
    .map((snapshot): HistoryPoint => {
      const description = snapshot.period
        ? `Week ${snapshot.period.start} to ${snapshot.period.end}`
        : `Snapshot ${snapshot.asOf}`;
      const base = {
        id: snapshot.id,
        asOf: snapshot.asOf,
        description: `${description}${snapshot.configSource === "current" ? " (current config)" : ""}`,
      };
      const view = snapshot.module?.views.find(
        (item) => item.name === (moduleName === "todo" ? "default" : viewName),
      );
      if (!view) return { ...base, values: null, error: "View not present in this snapshot." };
      if (view.status !== "available") {
        return { ...base, values: null, error: view.error || "View is unavailable." };
      }

      const values = new Map<string, number>();
      if (
        moduleName === "todo" ||
        !view.columns.includes("name") ||
        !view.columns.includes("total")
      ) {
        values.set("Total", view.rows.length);
      } else {
        for (const row of view.rows) {
          if (
            typeof row.name !== "string" ||
            typeof row.total !== "number" ||
            !Number.isFinite(row.total) ||
            row.total < 0
          ) {
            return { ...base, values: null, error: "Snapshot contains invalid chart data." };
          }
          values.set(row.name, (values.get(row.name) ?? 0) + row.total);
        }
      }
      for (const category of values.keys()) categories.add(category);
      return { ...base, values };
    });
  return { points, categories: [...categories].sort((a, b) => a.localeCompare(b)) };
};
