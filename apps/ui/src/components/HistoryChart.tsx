import { useEffect, useState } from "preact/hooks";
import { scaleBand, scaleLinear } from "@visx/scale";
import type { RuinsSnapshotHistoryEntry } from "@ruins/snapshots/types";
import { getHistoryData } from "./historyData";
import { useElementWidth } from "./useElementWidth";
import styles from "./HistoryChart.module.css";

const colors = ["#8558ff", "#0ea5e9", "#10b981", "#f59e0b", "#f43f5e", "#14b8a6", "#94a3b8"];
const colorFor = (index: number) =>
  colors[index] ?? `hsl(${Math.round(index * 137.508) % 360} 65% 52%)`;

export const HistoryChart = ({
  moduleName,
  moduleLabel,
  viewName,
  viewLabel,
}: {
  moduleName: string;
  moduleLabel: string;
  viewName: string;
  viewLabel: string;
}) => {
  const [snapshots, setSnapshots] = useState<RuinsSnapshotHistoryEntry[]>();
  const [error, setError] = useState("");
  const { ref, width } = useElementWidth();

  useEffect(() => {
    let active = true;
    setSnapshots(undefined);
    setError("");
    fetch(`/api/snapshots?module=${encodeURIComponent(moduleName)}`)
      .then(async (response) => {
        if (!response.ok) throw new Error(`Could not load snapshot history (${response.status}).`);
        return (await response.json()) as RuinsSnapshotHistoryEntry[];
      })
      .then((items) => {
        if (active) setSnapshots(items);
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : String(loadError));
      });
    return () => {
      active = false;
    };
  }, [moduleName]);

  const { points, categories } = getHistoryData(snapshots ?? [], moduleName, viewName);
  const unavailable = points.filter((point) => point.values === null).length;
  const chartWidth = Math.max(width, points.length * 38 + 60);
  const height = 260;
  const margin = { top: 16, right: 16, bottom: 42, left: 44 };
  const x = scaleBand({
    domain: points.map((point) => point.id),
    range: [margin.left, chartWidth - margin.right],
    padding: 0.25,
  });
  const maxTotal = Math.max(
    1,
    ...points.map((point) =>
      [...(point.values?.values() ?? [])].reduce((sum, value) => sum + value, 0),
    ),
  );
  const y = scaleLinear({
    domain: [0, maxTotal],
    range: [height - margin.bottom, margin.top],
    nice: true,
  });
  const labelStep = Math.max(
    1,
    Math.ceil(points.length / Math.max(1, Math.floor(chartWidth / 95))),
  );

  return (
    <div ref={ref} className={styles.wrap} aria-label={`${moduleLabel} history`}>
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : !snapshots ? (
        <p className={styles.message}>Loading history…</p>
      ) : points.length === 0 ? (
        <p className={styles.message}>
          No snapshots yet. Run <code>ruins --snapshot</code> or{" "}
          <code>ruins --snapshot-history</code>.
        </p>
      ) : (
        <>
          {moduleName === "commits" && (
            <p className={styles.message}>
              Each bar reflects the configured commit history window at that snapshot, not only
              commits from that week.
            </p>
          )}
          {unavailable > 0 && (
            <p className={styles.message} role="status">
              {unavailable} {unavailable === 1 ? "snapshot is" : "snapshots are"} unavailable for
              this view; × marks missing data.
            </p>
          )}
          <div className={styles.scroll}>
            {width > 0 && (
              <svg
                width={chartWidth}
                height={height}
                role="img"
                aria-label={`${moduleLabel} ${moduleName === "todo" ? "total" : viewLabel} history chart`}
              >
                {y.ticks(4).map((tick) => (
                  <g key={tick}>
                    <line
                      x1={margin.left}
                      x2={chartWidth - margin.right}
                      y1={y(tick)}
                      y2={y(tick)}
                      className={styles.grid}
                    />
                    <text
                      x={margin.left - 8}
                      y={y(tick) + 4}
                      textAnchor="end"
                      className={styles.axis}
                    >
                      {tick}
                    </text>
                  </g>
                ))}
                {points.map((point, index) => {
                  const position = x(point.id) ?? 0;
                  let sum = 0;
                  return (
                    <g key={point.id}>
                      {point.values === null ? (
                        <text
                          x={position + x.bandwidth() / 2}
                          y={height - margin.bottom - 5}
                          textAnchor="middle"
                          className={styles.missing}
                        >
                          <title>{`${point.description}: ${point.error}`}</title>×
                        </text>
                      ) : (
                        <>
                          {categories.map((category, categoryIndex) => {
                            const value = point.values?.get(category) ?? 0;
                            const previous = sum;
                            sum += value;
                            return value > 0 ? (
                              <rect
                                key={category}
                                x={position}
                                y={y(sum)}
                                width={x.bandwidth()}
                                height={Math.max(0, y(previous) - y(sum))}
                                fill={colorFor(categoryIndex)}
                              >
                                <title>{`${point.description}\n${category}: ${value}`}</title>
                              </rect>
                            ) : null;
                          })}
                          {sum === 0 && (
                            <circle
                              cx={position + x.bandwidth() / 2}
                              cy={y(0)}
                              r={3}
                              fill={colorFor(0)}
                            >
                              <title>{`${point.description}\nTotal: 0`}</title>
                            </circle>
                          )}
                        </>
                      )}
                      {index % labelStep === 0 && (
                        <text
                          x={position + x.bandwidth() / 2}
                          y={height - margin.bottom + 18}
                          textAnchor="middle"
                          className={styles.axis}
                        >
                          {point.asOf.slice(0, 10)}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            )}
          </div>
          {categories.length > 0 && (
            <div className={styles.legend} aria-label="Chart categories">
              {categories.map((category, index) => (
                <span key={category}>
                  <i style={{ background: colorFor(index) }} />
                  {category}
                </span>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
