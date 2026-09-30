import { defineHandler } from "nitro/h3";
import { readConfig } from "@ruins/config";
import { readRuinsFile } from "../utils/readRuinsFile.js";
import type { UiTransformContext } from "@ruins/types";

export type ViewData = Record<string, number | string | boolean | undefined | null>[];

const loadView = async (
  moduleName: string,
  viewName: string,
  query: Record<string, string>,
): Promise<ViewData | undefined> => {
  const config = await readConfig();
  if (!config.modules) {
    return;
  }

  const module = config.modules.find((m) => m.meta.name === moduleName);
  if (!module) {
    return;
  }
  const view = module.ui?.views?.find((v) => v.name === viewName);
  if (!view || (!view.getData && !view.file)) {
    return;
  }

  const context: UiTransformContext = { config, query };
  const rawData = view.getData ? await view.getData(context) : await readRuinsFile(config, view.file!);

  return view.transformerFn(rawData, context);
};

export default defineHandler(async (event) => {
  const requestUrl = new URL(event.req.url, "http://localhost");
  const params = requestUrl.searchParams;
  const module = params.get("module") ?? "";
  const view = params.get("view") ?? "";
  return await loadView(module, view, Object.fromEntries(params.entries()));
});
