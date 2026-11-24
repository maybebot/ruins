import { useEffect, useState } from "preact/hooks";
import { AppHeader } from "./components/AppHeader";
import { ModulePanel } from "./components/ModulePanel";
import type { DrilldownSelection, RuinsModuleSimplified, UiDataPanel } from "./types";
import styles from "./App.module.css";

type Theme = "light" | "dark";

const getInitialTheme = (): Theme => {
  const storedTheme = window.localStorage.getItem("ruins-theme");
  if (storedTheme === "light" || storedTheme === "dark") return storedTheme;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const getView = async (
  moduleName: string,
  viewName: string,
  selection?: { query: string; value: string },
) => {
  const query = new URLSearchParams({ module: moduleName, view: viewName });
  if (selection) {
    if (selection.query === "module" || selection.query === "view") {
      throw new Error(`Reserved drill-down query parameter: ${selection.query}`);
    }
    query.set(selection.query, selection.value);
  }
  const res = await fetch(`/api/view?${query}`);
  if (!res.ok) {
    const message = res.headers.get("content-type")?.includes("application/json")
      ? ((await res.json()) as { error?: string }).error
      : undefined;
    throw new Error(message ?? `Could not load ${moduleName} / ${viewName} (${res.status})`);
  }
  return res.json() as Promise<UiDataPanel>;
};

export const App = () => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [modules, setModules] = useState<RuinsModuleSimplified[]>([]);
  const [viewData, setViewData] = useState<Record<string, UiDataPanel>>({});
  const [activeViews, setActiveViews] = useState<Record<string, string>>({});
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [selections, setSelections] = useState<Record<string, DrilldownSelection | undefined>>({});
  const [error, setError] = useState("");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("ruins-theme", theme);
  }, [theme]);

  useEffect(() => {
    let active = true;
    void (async () => {
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

  const selectView = async (moduleName: string, viewName: string, loadData = true) => {
    setActiveViews((current) => ({ ...current, [moduleName]: viewName }));
    setSelections((current) => ({ ...current, [moduleName]: undefined }));
    const key = `${moduleName}:${viewName}`;
    if (!loadData || viewData[key]) return;
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

  const selectDrilldown = async (
    moduleName: string,
    viewName: string,
    query: string,
    value: string,
  ) => {
    try {
      const data = await getView(moduleName, viewName, { query, value });
      setSelections((current) => ({ ...current, [moduleName]: { value, data } }));
      setFilters((current) => ({ ...current, [moduleName]: "" }));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Dashboard request failed");
    }
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
            onSelectView={(viewName, loadData) =>
              void selectView(module.meta.name, viewName, loadData)
            }
            onSelectGroup={(viewName, directory) =>
              selectGroup(module.meta.name, viewName, directory)
            }
            selection={selections[module.meta.name]}
            onSelectDrilldown={(viewName, query, value) =>
              void selectDrilldown(module.meta.name, viewName, query, value)
            }
            onBack={() => {
              setSelections((current) => ({ ...current, [module.meta.name]: undefined }));
              setFilters((current) => ({ ...current, [module.meta.name]: "" }));
            }}
          />
        ))}
      </main>
    </div>
  );
};
