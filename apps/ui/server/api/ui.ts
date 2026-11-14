import { defineHandler } from "nitro/h3";
import { readConfig } from "@ruins/config";
import { getModuleViews } from "../utils/getModuleViews.js";

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
            views: getModuleViews(config.modules, module).map(
              ({ name, label, columns, drilldown }) => ({
                name,
                label,
                columns,
                drilldown,
              }),
            ),
          }
        : undefined,
    })),
  };
};

export default defineHandler(() => {
  return loadModules();
});
