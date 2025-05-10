import consola from "consola";
import type { RuinsOutput } from "../../../types/ruins";
import { getCommits } from "../../../config/getCommits";

export type CommitsEntry = { name: string; total: number }[];

export type CommitsRes = RuinsOutput<{
  scope: CommitsEntry;
  type: CommitsEntry;
}>;

export default eventHandler(async (): Promise<CommitsRes> => {
  const commits = await getCommits();
  if (!commits?.meta) {
    consola.error("[commits] Collection file not found, did you generate it?");
    return;
  }

  const scopes = Object.groupBy(commits.data, (l) => l.meta?.scope);
  const scope = [];
  for (const [key, value] of Object.entries(scopes)) {
    scope.push({ name: key, total: value.length });
  }
  scope.sort((a, b) => b.total - a.total);

  const types = Object.groupBy(commits.data, (l) => l.meta?.type);
  const type = [];
  for (const [key, value] of Object.entries(types)) {
    type.push({ name: key, total: value.length });
  }
  type.sort((a, b) => b.total - a.total);

  return { data: { scope, type } };
});
