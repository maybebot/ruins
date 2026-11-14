import styles from "./SvgIcon.module.css";

export const SvgIcon = ({ source, className }: { source: string; className?: string }) => (
  <span
    aria-hidden="true"
    className={`${styles.svgIcon}${className ? ` ${className}` : ""}`}
    dangerouslySetInnerHTML={{ __html: source }}
  />
);
