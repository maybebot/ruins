import { useState } from "preact/hooks";
import { SvgIcon } from "./SvgIcon";
import ghostIcon from "../assets/icons/ghost.svg?raw";
import githubIcon from "../assets/icons/github.svg?raw";
import listIcon from "../assets/icons/list.svg?raw";
import moonIcon from "../assets/icons/moon.svg?raw";
import sunIcon from "../assets/icons/sun.svg?raw";
import styles from "./AppHeader.module.css";

export const AppHeader = ({
  theme,
  onToggleTheme,
}: {
  theme: "light" | "dark";
  onToggleTheme: () => void;
}) => {
  const [ghostFlight, setGhostFlight] = useState(0);

  return (
    <header className={styles.appHeader}>
      <div className={styles.headerInner}>
        <a
          className={styles.brand}
          href="/"
          aria-label="Ruins dashboard"
          onFocus={() => setGhostFlight((flight) => flight + 1)}
        >
          <span
            className={styles.brandGhost}
            onMouseEnter={() => setGhostFlight((flight) => flight + 1)}
          >
            <SvgIcon
              key={ghostFlight}
              source={ghostIcon}
              className={ghostFlight ? styles.ghostFlight : ""}
            />
          </span>
          <span className={styles.brandName}>ruins</span>
        </a>
        <nav className={styles.headerActions} aria-label="Dashboard links">
          <a
            className={styles.headerLink}
            href="https://github.com/maybebot/ruins"
            target="_blank"
            rel="noreferrer"
            title="Ruins on GitHub"
          >
            <SvgIcon source={githubIcon} />
            <span>GitHub</span>
          </a>
          <a
            className={styles.headerLink}
            href="https://github.com/maybebot/ruins#readme"
            target="_blank"
            rel="noreferrer"
            title="Read the Ruins documentation"
          >
            <SvgIcon source={listIcon} />
            <span>README</span>
          </a>
          <button
            className={styles.themeToggle}
            type="button"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            onClick={onToggleTheme}
          >
            <SvgIcon source={theme === "dark" ? sunIcon : moonIcon} />
          </button>
        </nav>
      </div>
    </header>
  );
};
