export interface RuinsMeta {
  timestamp: number;
}

/** Standard output of files in .ruins */
export interface RuinsOutput<T = any[]> {
  meta: {
    timestamp: number;
  };
  data: T;
}
