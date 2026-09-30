export const SvgIcon = ({
  source,
  className,
}: {
  source: string;
  className?: string;
}) => (
  <span
    aria-hidden="true"
    className={`svg-icon${className ? ` ${className}` : ""}`}
    dangerouslySetInnerHTML={{ __html: source }}
  />
);