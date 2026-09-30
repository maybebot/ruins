import { defineHandler } from "nitro/h3";
import { readConfig } from "@ruins/config";

/** Returns modules used by consumer */
const loadModules = async () => {
  const config = await readConfig();
  if (!config.modules) {
    return;
  }

  return {
    modules: config.modules.map((module) => ({
      meta: module.meta,
      ui: module.ui
        ? {
            name: module.ui.name,
            icon: module.ui.icon,
            views: module.ui.views?.map(({ name, label, columns }) => ({ name, label, columns })),
          }
        : undefined,
    })),
  };
};

export default defineHandler(() => {
  return loadModules();
});
