import type { RuinsConfigInternal } from "@ruins/config";
import { loadConfig } from "c12";

/**
 * Read files in .ruins dir, helper
 */
export const readRuinsFile = async (config: RuinsConfigInternal, filename: string) => {
  const { config: fileContents } = await loadConfig({
    cwd: config._paths.ruinsDir,
    configFile: filename,
  });
  return fileContents;
};
