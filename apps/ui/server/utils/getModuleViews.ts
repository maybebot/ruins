import type { RuinsModule } from "@ruins/types";

export const getModuleViews = (modules: RuinsModule[], module: RuinsModule) => {
  const views = [
    ...(module.ui?.views ?? []),
    ...modules.flatMap((source) =>
      source.uiViews?.module === module.meta.name ? source.uiViews.views : [],
    ),
  ];
  const names = new Set<string>();
  for (const view of views) {
    if (names.has(view.name)) {
      throw new Error(`Duplicate view "${view.name}" for module "${module.meta.name}"`);
    }
    names.add(view.name);
  }
  return views;
};
