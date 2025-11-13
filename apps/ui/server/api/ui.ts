import { defineHandler } from "nitro/h3";
import { readConfig } from "@ruins/config";

const loadModules = async () => {
  const config = await readConfig();
  if (!config.modules) {
    return;
  }

  return { modules: config.modules };
};

export default defineHandler(() => {
  return loadModules();
});
