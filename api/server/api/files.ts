import { getConfig } from "../../../config/getConfig";
import { RuinsOutput } from "../../../types/ruins";

interface Issue {
  name: string;
  error: number;
  warning: number;
  total: number;
  data?: Issue[];
}

export type FilesRes = RuinsOutput<Issue[]>;

/** sortBy: error | warning | total, grouped */
export default eventHandler(async (event): Promise<FilesRes> => {
  const lint = await $fetch("/api/data");
  if (!lint.meta) {
    throw createError({
      status: 204,
      statusMessage: "No file",
    });
  }
  const config = await getConfig();

  const params = new URLSearchParams(event.path.split("?")[1]);
  let sortBy = params.get("sortBy") as "error" | "warning" | "total";
  if (!["error", "warning", "total"].includes(sortBy)) {
    sortBy = "total";
  }
  const isGrouped = Boolean(params.get("grouped"));

  const data = lint.issues
    .map((issue) => ({
      name: issue.filePath,
      error: issue.errorCount,
      warning: issue.warningCount,
      total: issue.errorCount + issue.warningCount,
    }))
    .sort((a, b) => b[sortBy] - a[sortBy]);

  if (isGrouped && config?.group?.dirs) {
    const grouped = config.group.dirs
      .reduce((acc: Issue[], dir) => {
        const files = data.filter((f) => f.name.startsWith(dir));
        acc.push({
          name: dir,
          error: files.reduce((acc, f) => acc + f.error, 0),
          warning: files.reduce((acc, f) => acc + f.warning, 0),
          total: files.reduce((acc, f) => acc + f.total, 0),
          data: files,
        });
        return acc;
      }, [] as typeof data)
      .sort((a, b) => b[sortBy] - a[sortBy]);

    const totalGrouped = grouped.reduce((acc, entry) => acc + entry.total, 0);
    const total = lint.issues.reduce(
      (acc, entry) => acc + entry.messages.length,
      0
    );
    const totals = { total, grouped: totalGrouped };
    return { data: grouped, totals };
  }

  return { data };
});
