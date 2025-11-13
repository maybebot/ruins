import { defineHandler } from "nitro/h3";
import { readConfig } from "@ruins/config";
import { readRuinsFile } from "../utils/readRuinsFile.js";

const loadView = async (moduleSearch: string, viewSearch: string) => {
  const config = await readConfig();
  if (!config.modules) {
    return;
  }
  console.log("mmmm", config);

  const module = config.modules.find((m) => m.meta.name === moduleSearch);
  console.log("fff", module, moduleSearch);
  if (!module) {
    return;
  }
  const view = module.ui?.views?.find((v) => v.name === viewSearch);
  if (!view) {
    return;
  }

  console.log("inside");

  const fileContents = await readRuinsFile(config, view.file);
  const data = view.processFn(fileContents);

  return {
    data,
    view,
    module,
  };
};

export default defineHandler(async (event) => {
  const paramsString = event.req.url;
  const params = new URLSearchParams(paramsString);
  const module = params.get("module") ?? "";
  const view = params.get("view") ?? "";
  return await loadView(module, view);
});
