export interface ParsedConventionalCommit {
  type?: string;
  scope?: string;
  description?: string;
}

export interface CommitEntry {
  hash: string;
  email: string;
  message: string;
  date: string;
  meta?: ParsedConventionalCommit;
}

export type RuinsCommitsOutput = {
  meta: { timestamp: number };
  data: CommitEntry[];
};
