import consola from "consola";
import type { RuinsOutput } from "../../../types/ruins";
import { getGitlog } from "../../../config/getGitlog";

export type GitlogEntry = { name: string; total: number }[];

export type GitlogRes = RuinsOutput<{
  scope: GitlogEntry;
  type: GitlogEntry;
}>;

export default eventHandler(async (event): Promise<GitlogRes> => {
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
