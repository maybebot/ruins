import { getLintResults, getConfig } from "#imports";

interface DataPoint {
  name: string;
  error: number;
  warning: number;
  total: number;
  data?: DataPoint[];
}
interface FilesRes {
  data: DataPoint[];
}

/** sortBy: error | warning | total, grouped */
export default eventHandler(async (event): Promise<FilesRes> => {
  const lint = await getLintResults();
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
    const grouped = config.group.dirs.reduce((acc: DataPoint[], dir) => {
      const files = data.filter((f) => f.name.startsWith(dir));
      if (files.length > 0) {
        acc.push({
          name: dir,
          error: files.reduce((acc, f) => acc + f.error, 0),
          warning: files.reduce((acc, f) => acc + f.warning, 0),
          total: files.reduce((acc, f) => acc + f.total, 0),
          data: files,
        });
      }
      return acc;
    }, [] as typeof data);

    return { data: grouped };
  }

  return { data };
});
