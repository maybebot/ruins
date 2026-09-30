import type { ParsedConventionalCommit } from "./types.js";

const conventionalCommitRegex = /^(?<type>\w+)(\((?<scope>[^)]+)\))?: (?<description>.+)$/;

/** Parse conventional commit, returns undefined if not valid, its parts if valid */
export const parseConventionalCommit = (message: string): ParsedConventionalCommit | undefined => {
  const match = message.match(conventionalCommitRegex);
  if (!match || !match.groups) return undefined;

  const { type, scope, description } = match.groups;
  return { type, scope, description };
};
