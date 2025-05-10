export interface RuinsMeta {
  timestamp: number;
}

/** Standard output of files in .ruins */
export interface RuinsOutput<T = any[]> {
  meta?: {
    timestamp: number;
  };
  data: T;
  totals?: any;
}

export type RuinsTodos = Array<{ file: string; todo: string }>;

export type RuinsCommits = Array<{
  hash: string;
  email: string;
  message: string;
  date: string;
  meta?: {
    type: string;
    scope: string;
    description: string;
  };
}>;
