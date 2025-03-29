export interface RuinsMeta {
  timestamp: number;
}

/** Standard output of files in .ruins */
export interface RuinsOutput {
  meta: {
    timestamp: number;
  };
  data: any[];
}
