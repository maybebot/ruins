import { getLintResults } from "#imports";

interface FilesRes {
  data: { name: string; error: number; warning: number; total: number }[];
}

export default eventHandler(async (event): Promise<FilesRes> => {
  const lint = await getLintResults();

  let sortBy = new URLSearchParams(event.path.split("?")[1]).get("sortBy") as
    | "error"
    | "warning"
    | "total";
  if (!["error", "warning", "total"].includes(sortBy)) {
    sortBy = "total";
  }

  const data = lint.issues
    .map((issue) => ({
      name: issue.filePath,
      error: issue.errorCount,
      warning: issue.warningCount,
      total: issue.errorCount + issue.warningCount,
    }))
    .sort((a, b) => b[sortBy] - a[sortBy]);

  return { data };
});
