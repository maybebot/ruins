import type { RuinsModuleSimplified, UiDataPanel } from "../types";
import { SvgIcon } from "./SvgIcon";
import compassIcon from "../assets/icons/compass.svg?raw";
import foldersIcon from "../assets/icons/folders.svg?raw";
import listIcon from "../assets/icons/list.svg?raw";
import pickaxeIcon from "../assets/icons/pickaxe.svg?raw";
import shieldIcon from "../assets/icons/shield.svg?raw";
import swordsIcon from "../assets/icons/swords.svg?raw";
import styles from "./ModulePanel.module.css";

export const ModulePanel = ({
  module,
  activeViewName,
  viewData,
  filter,
  onFilter,
  onSelectView,
  onSelectGroup,
}: {
  module: RuinsModuleSimplified;
  activeViewName?: string;
  viewData: Record<string, UiDataPanel>;
  filter: string;
  onFilter: (filter: string) => void;
  onSelectView: (viewName: string) => void;
  onSelectGroup: (viewName: string, directory: string) => void;
}) => {
  const views = module.ui?.views ?? [];
  const defaultView = views.find((view) => view.name === "default") ?? views[0];
  const activeView = views.find((view) => view.name === (activeViewName ?? defaultView?.name));
  if (!activeView) return null;
  const data = viewData[`${module.meta.name}:${activeView.name}`] ?? [];
  const filteredData = data.filter((item) =>
    Object.values(item).join(" ").toLowerCase().includes(filter.toLowerCase()),
  );
  const moduleIcon =
    module.ui?.icon === "compass"
      ? compassIcon
      : module.ui?.icon === "pickaxe"
        ? pickaxeIcon
        : module.ui?.icon === "swords"
          ? swordsIcon
          : undefined;

  return (
    <section className={styles.modulePanel}>
      <header className={styles.moduleHeading}>
        {moduleIcon && <SvgIcon source={moduleIcon} className={styles.moduleIcon} />}
        <div>
          <h2>{module.ui?.name ?? module.meta.name}</h2>
          <p>{module.meta.description}</p>
        </div>
      </header>
      {views.length > 1 && (
        <nav className={styles.viewTabs} aria-label={`${module.meta.name} views`}>
          {views.map((view) => {
            const viewIcon =
              view.name === "default"
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
                aria-pressed={activeView.name === view.name}
                onClick={() => {
                  if (view.name === "grouped") onFilter("");
                  onSelectView(view.name);
                }}
              >
                {viewIcon && <SvgIcon source={viewIcon} className={styles.viewTabIcon} />}
                {view.label ?? view.name}
              </button>
            );
          })}
        </nav>
      )}
      <div className={styles.viewToolbar}>
        <input
          type="search"
          value={filter}
          aria-label={`Filter ${module.ui?.name ?? module.meta.name}`}
          placeholder="Filter results"
          onInput={(event) => onFilter(event.currentTarget.value)}
        />
        <span>{filteredData.length} results</span>
      </div>
      <div className={styles.tableScroll}>
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
                        className={styles.groupLink}
                        onClick={() =>
                          onSelectGroup(defaultView.name, String(item[column.name] ?? ""))
                        }
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
        {filteredData.length === 0 && <p className={styles.emptyState}>No data for this view.</p>}
      </div>
    </section>
  );
};
