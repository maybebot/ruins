import { useEffect, useState } from "preact/hooks";
import type { RuinsModuleSimplified, UiDataPanel } from "./types";
import { SvgIcon } from "./components/SvgIcon";
import compassIcon from "./assets/icons/compass.svg?raw";
import foldersIcon from "./assets/icons/folders.svg?raw";
import ghostIcon from "./assets/icons/ghost.svg?raw";
import githubIcon from "./assets/icons/github.svg?raw";
import listIcon from "./assets/icons/list.svg?raw";
import moonIcon from "./assets/icons/moon.svg?raw";
import pickaxeIcon from "./assets/icons/pickaxe.svg?raw";
import shieldIcon from "./assets/icons/shield.svg?raw";
import swordsIcon from "./assets/icons/swords.svg?raw";
import sunIcon from "./assets/icons/sun.svg?raw";

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
  const [ghostFlight, setGhostFlight] = useState(0);
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
              getView(module.meta.name, initialView.name).then((viewData) => [
                `${module.meta.name}:${initialView.name}`,
                viewData,
              ] as const),
            ];
          }),
        );
        if (!active) return;
        setViewData(Object.fromEntries(entries));
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : "Dashboard request failed");
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
    <div className="dashboard">
      <header className="app-header">
        <div className="header-inner">
          <a
            className="brand"
            href="/"
            aria-label="Ruins dashboard"
            onFocus={() => setGhostFlight((flight) => flight + 1)}
          >
            <span
              className="brand-ghost"
              onMouseEnter={() => setGhostFlight((flight) => flight + 1)}
            >
              <SvgIcon key={ghostFlight} source={ghostIcon} className={ghostFlight ? "ghost-flight" : ""} />
            </span>
            <span className="brand-name">ruins</span>
            <span className="brand-caption">TECH DEBT DASHBOARD</span>
          </a>
          <nav className="header-actions" aria-label="Dashboard links">
            <a
              className="header-link"
              href="https://github.com/maybebot/ruins"
              target="_blank"
              rel="noreferrer"
              title="Ruins on GitHub"
            >
              <SvgIcon source={githubIcon} />
              <span>GitHub</span>
            </a>
            <a
              className="header-link"
              href="https://github.com/maybebot/ruins#readme"
              target="_blank"
              rel="noreferrer"
              title="Read the Ruins documentation"
            >
              <SvgIcon source={listIcon} />
              <span>README</span>
            </a>
            <button
              className="theme-toggle"
              type="button"
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
            >
              <SvgIcon source={theme === "dark" ? sunIcon : moonIcon} />
            </button>
          </nav>
        </div>
      </header>
      <main>
        {error && <p className="dashboard-error" role="alert">{error}</p>}
        {modules.map((module) => {
        const views = module.ui?.views ?? [];
        const activeViewName = activeViews[module.meta.name] ?? views.find((view) => view.name === "default")?.name ?? views[0]?.name;
        const activeView = views.find((view) => view.name === activeViewName);
        if (!activeView) return null;
        const data = viewData[`${module.meta.name}:${activeView.name}`] ?? [];
        const filter = filters[module.meta.name] ?? "";
        const filteredData = data.filter((item) =>
          Object.values(item).join(" ").toLowerCase().includes(filter.toLowerCase()),
        );
        const defaultView = views.find((view) => view.name === "default") ?? views[0];
        const moduleIcon = module.ui?.icon === "compass"
          ? compassIcon
          : module.ui?.icon === "pickaxe"
            ? pickaxeIcon
            : module.ui?.icon === "swords"
              ? swordsIcon
              : undefined;

        return (
          <section key={module.meta.name} className="module-panel">
            <header className="module-heading">
              {moduleIcon && <SvgIcon source={moduleIcon} className="module-icon" />}
              <div>
                <h2>{module.ui?.name ?? module.meta.name}</h2>
              <p>{module.meta.description}</p>
              </div>
            </header>
            {views.length > 1 && (
              <nav className="view-tabs" aria-label={`${module.meta.name} views`}>
                {views.map((view) => {
                  const viewIcon = view.name === "default"
                    ? listIcon
                    : view.name === "grouped"
                      ? foldersIcon
                      : view.name === "rules"
                        ? shieldIcon
                        : undefined;
                  return (
                  <button
                    key={view.name}
                    type="button"
                    className={activeView.name === view.name ? "active" : ""}
                    aria-pressed={activeView.name === view.name}
                    onClick={() => {
                      if (view.name === "grouped") setFilters((current) => ({ ...current, [module.meta.name]: "" }));
                      void selectView(module.meta.name, view.name);
                    }}
                  >
                    {viewIcon && <SvgIcon source={viewIcon} className="view-tab-icon" />}
                    {view.label ?? view.name}
                  </button>
                  );
                })}
              </nav>
            )}
            <div className="view-toolbar">
              <input
                type="search"
                value={filter}
                aria-label={`Filter ${module.ui?.name ?? module.meta.name}`}
                placeholder="Filter results"
                onInput={(event) =>
                  setFilters((current) => ({ ...current, [module.meta.name]: event.currentTarget.value }))
                }
              />
              <span>{filteredData.length} results</span>
            </div>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    {activeView.columns.map((column) => (
                      <th key={column.name}>{column.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item, index) => (
                    <tr key={index}>
                      {activeView.columns.map((column, columnIndex) => (
                        <td key={column.name}>
                          {activeView.name === "grouped" && columnIndex === 0 ? (
                            <button
                              type="button"
                              className="group-link"
                              onClick={() => selectGroup(module.meta.name, defaultView.name, String(item[column.name] ?? ""))}
                            >
                              {String(item[column.name] ?? "")}
                            </button>
                          ) : (
                            String(item[column.name] ?? "")
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredData.length === 0 && <p className="empty-state">No data for this view.</p>}
            </div>
          </section>
          );
        })}
      </main>
    </div>
  );
};
