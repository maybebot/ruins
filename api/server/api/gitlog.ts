import { getGitlog } from "../../../config/getGitlog";
import consola from "consola";

export default eventHandler(async (event) => {
  const gitlog = await getGitlog();
  if (!gitlog?.meta) {
    consola.error("[gitlog] Collection file not found, did you generate it?");
    return;
  }

  const scopes = Object.groupBy(gitlog.data, (l) => l.meta?.scope);
  let scope = [];
  for (const [key, value] of Object.entries(scopes)) {
    scope.push({ name: key, total: value.length });
  }
  scope.sort((a, b) => b.total - a.total);

  const types = Object.groupBy(gitlog.data, (l) => l.meta?.type);
  let type = [];
  for (const [key, value] of Object.entries(types)) {
    type.push({ name: key, total: value.length });
  }
  type.sort((a, b) => b.total - a.total);

  return { data: { scope, type } };
});
