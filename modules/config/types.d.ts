/**
 * Definition of Ruins config in user's /ruins.config.ts file
 */
export interface RuinsConfig {
  /** Directory where ruins files are stored. Do not .gitignore */
  dir: string;
  /** Paths in your app to directories you want to show grouped results */
  group?: {
    dirs: string[];
  };
  /** Module-specific configuration */
  modules: {}[];
}
