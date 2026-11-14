import { useEffect, useState } from "preact/hooks";
import { AppHeader } from "./components/AppHeader";
import { ModulePanel } from "./components/ModulePanel";
import type { RuinsModuleSimplified, UiDataPanel } from "./types";
import styles from "./App.module.css";

type Theme = "light" | "dark";

const getInitialTheme = (): Theme => {
  const storedTheme = window.localStorage.getItem("ruins-theme");
  if (storedTheme === "light" || storedTheme === "dark") return storedTheme;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const getView = async (moduleName: string, viewName: string) => {
  const query = new URLSearchParams({ module: moduleName, view: viewName });
  const res = await fetch(`/api/view?${query}`);
  if (!res.ok) {
    throw new Error(`Could not load ${moduleName} / ${viewName}`);
  }
  return res.json() as Promise<UiDataPanel>;
};

export const App = () => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [modules, setModules] = useState<RuinsModuleSimplified[]>([]);
  const [viewData, setViewData] = useState<Record<string, UiDataPanel>>({});
  const [activeViews, setActiveViews] = useState<Record<string, string>>({});
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [error, setError] = useState("");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("ruins-theme", theme);
  }, [theme]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/ui");
        if (!res.ok) {
          throw new Error("Could not load dashboard modules");
        }
        const data = (await res.json()) as { modules: RuinsModuleSimplified[] };
        if (!active) return;
        setModules(data.modules);

        const entries = await Promise.all(
          data.modules.flatMap((module) => {
            const views = module.ui?.views ?? [];
            const initialView = views.find((view) => view.name === "default") ?? views[0];
            if (!initialView) return [];
            return [
              getView(module.meta.name, initialView.name).then(
                (viewData) => [`${module.meta.name}:${initialView.name}`, viewData] as const,
              ),
            ];
          }),
        );
        if (!active) return;
        setViewData(Object.fromEntries(entries));
      } catch (loadError) {
        if (active)
          setError(loadError instanceof Error ? loadError.message : "Dashboard request failed");
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const selectView = async (moduleName: string, viewName: string) => {
    setActiveViews((current) => ({ ...current, [moduleName]: viewName }));
    const key = `${moduleName}:${viewName}`;
    if (viewData[key]) return;
    try {
      const data = await getView(moduleName, viewName);
      setViewData((current) => ({ ...current, [key]: data }));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Dashboard request failed");
    }
  };

  const selectGroup = (moduleName: string, viewName: string, directory: string) => {
    if (directory === "In other places") return;
    setFilters((current) => ({ ...current, [moduleName]: directory }));
    setActiveViews((current) => ({ ...current, [moduleName]: viewName }));
  };

  return (
    <div>
      <AppHeader
        theme={theme}
        onToggleTheme={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
      />
      <main className={styles.main}>
        {error && (
          <p className={styles.dashboardError} role="alert">
            {error}
          </p>
        )}
        {modules.map((module) => (
          <ModulePanel
            key={module.meta.name}
            module={module}
            activeViewName={activeViews[module.meta.name]}
            viewData={viewData}
            filter={filters[module.meta.name] ?? ""}
            onFilter={(filter) =>
              setFilters((current) => ({ ...current, [module.meta.name]: filter }))
            }
            onSelectView={(viewName) => void selectView(module.meta.name, viewName)}
            onSelectGroup={(viewName, directory) =>
              selectGroup(module.meta.name, viewName, directory)
            }
          />
        ))}
      </main>
    </div>
  );
};
