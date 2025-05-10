/**
 * Parse conventional commit, returns undefined if not valid, its parts if valid
 */
export const parseConventionalCommit = (message: string) => {
  const conventionalCommitRegex = /^(?<type>\w+)(\((?<scope>[^)]+)\))?: (?<description>.+)$/;

  const match = message.match(conventionalCommitRegex);
  if (!match || !match.groups) return;

  const { type, scope, description } = match.groups;
  return { type, scope, description };
};
