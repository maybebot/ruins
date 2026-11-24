import { Group } from "@visx/group";
import { scaleBand, scaleLinear, scaleOrdinal } from "@visx/scale";
import { Bar, Pie } from "@visx/shape";
import { Tooltip, useTooltip } from "@visx/tooltip";
import type { UiDataPanel } from "../types";
import { useElementWidth } from "./useElementWidth";
import styles from "./ModuleChart.module.css";

const height = 240;
const rowHeight = 28;
const stackColors = ["var(--chart-5)", "var(--chart-4)"];
const colors = Array.from({ length: 7 }, (_, index) => `var(--chart-${index + 1})`);

type Datum = { name: string; total: number; parts: number[] };

const stackKeys = ["error", "warning"];

// Picks the chart from the shape of the view: severity columns are stacked,
// name/total rows are plotted directly, and text-only views are counted per column.
const getSpec = (moduleName: string, columns: string[]) => {
  if (stackKeys.every((key) => columns.includes(key))) return { type: "stacked" as const };
  if (columns.includes("total")) {
    return { type: moduleName === "commits" ? ("pie" as const) : ("bar" as const) };
  }
  const groupBy = columns.includes("author") ? "author" : columns[0];
  return { type: groupBy === "author" ? ("pie" as const) : ("bar" as const), groupBy };
};

const toData = (rows: UiDataPanel, spec: ReturnType<typeof getSpec>, limit: number): Datum[] => {
  if (spec.groupBy) {
    const counts = new Map<string, number>();
    for (const row of rows) {
      const key = String(row[spec.groupBy] ?? "unknown");
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return [...counts]
      .sort((left, right) => right[1] - left[1])
      .slice(0, limit)
      .map(([name, total]) => ({ name, total, parts: [total] }));
  }
  return rows.slice(0, limit).map((row) => {
    const parts =
      spec.type === "stacked" ? stackKeys.map((key) => Number(row[key])) : [Number(row.total)];
    return { name: String(row.name), total: Number(row.total), parts };
  });
};

type ChartProps = { moduleName: string; columns: string[]; rows: UiDataPanel };

export const ModuleChart = (props: ChartProps) => {
  const { ref, width } = useElementWidth();
  return (
    <div ref={ref} className={styles.wrap}>
      {width > 0 && <Chart {...props} width={width} />}
    </div>
  );
};

type TooltipData = { title: string; items: { color: string; label: string; value: number }[] };

const Chart = ({ moduleName, columns, rows, width }: ChartProps & { width: number }) => {
  const spec = getSpec(moduleName, columns);
  const type = spec.type;
  const data = toData(rows, spec, type === "pie" ? colors.length : 8);
  const { tooltipData, tooltipLeft, tooltipTop, showTooltip, hideTooltip } =
    useTooltip<TooltipData>();
  if (data.length === 0) return <p className={styles.empty}>No data for this view.</p>;

  const show = (event: MouseEvent, content: TooltipData) => {
    const svg = (event.currentTarget as SVGElement).ownerSVGElement;
    if (!svg) return;
    const box = svg.getBoundingClientRect();
    showTooltip({
      tooltipData: content,
      tooltipLeft: event.clientX - box.left,
      tooltipTop: event.clientY - box.top,
    });
  };
  const tooltip = tooltipData && (
    <Tooltip
      unstyled
      className={styles.tooltip}
      left={tooltipLeft}
      top={tooltipTop}
      style={
        tooltipLeft && tooltipLeft > width / 2
          ? { transform: "translate(calc(-100% - 12px), 12px)" }
          : undefined
      }
    >
      <strong>{tooltipData.title}</strong>
      {tooltipData.items.map((item) => (
        <div key={item.label} className={styles.tooltipRow}>
          <i style={{ background: item.color }} />
          <span>{item.label}</span>
          <b>{item.value}</b>
        </div>
      ))}
    </Tooltip>
  );

  if (type === "pie") {
    const color = scaleOrdinal({ domain: data.map((d) => d.name), range: colors });
    const sum = data.reduce((total, d) => total + d.total, 0);
    // Narrow containers put the legend below the donut instead of beside it
    const compact = width < height + 200;
    const radius = Math.min(height, width) / 2 - 4;
    return (
      <>
        <svg
          width={width}
          height={compact ? height + data.length * 24 + 16 : height}
          className={styles.chart}
          role="img"
          aria-label="Donut chart"
        >
          <Group top={height / 2} left={compact ? width / 2 : height / 2}>
            <Pie
              data={data}
              pieValue={(d) => d.total}
              outerRadius={radius}
              innerRadius={radius * 0.68}
              padAngle={0.025}
              cornerRadius={4}
            >
              {(pie) =>
                pie.arcs.map((arc) => (
                  <path
                    key={arc.data.name}
                    d={pie.path(arc) ?? ""}
                    fill={color(arc.data.name)}
                    className={styles.slice}
                    onMouseMove={(event) =>
                      show(event, {
                        title: arc.data.name,
                        items: [
                          {
                            color: color(arc.data.name),
                            label: `${Math.round((arc.data.total / sum) * 100)}%`,
                            value: arc.data.total,
                          },
                        ],
                      })
                    }
                    onMouseLeave={hideTooltip}
                  />
                ))
              }
            </Pie>
          </Group>
          <Group
            left={compact ? 0 : height + 24}
            top={compact ? height + 8 : height / 2 - (data.length * 24) / 2 + 6}
          >
            {data.map((d, index) => (
              <g key={d.name} transform={`translate(0, ${index * 24})`}>
                <circle cx={5} cy={5} r={5} fill={color(d.name)} />
                <text x={20} y={9} className={styles.label}>
                  {d.name}
                </text>
                <text
                  x={compact ? width : Math.max(160, width - height - 40)}
                  y={9}
                  textAnchor="end"
                  className={styles.value}
                >
                  {d.total}
                </text>
              </g>
            ))}
          </Group>
        </svg>
        {tooltip}
      </>
    );
  }

  const stacked = type === "stacked";
  const margin = { top: stacked ? 28 : 8, bottom: 24, right: 32 };
  const labelWidth = Math.min(width * 0.45, 200);
  const maxChars = Math.floor(labelWidth / 7) + 2;
  const chartHeight = margin.top + data.length * rowHeight + margin.bottom;
  const x = scaleLinear({
    domain: [0, Math.max(...data.map((d) => d.total))],
    range: [labelWidth, width - margin.right],
    nice: true,
  });
  const y = scaleBand({
    domain: data.map((d) => d.name),
    range: [margin.top, margin.top + data.length * rowHeight],
    padding: 0.35,
  });
  return (
    <>
      <svg
        width={width}
        height={chartHeight}
        className={styles.chart}
        role="img"
        aria-label="Bar chart"
      >
        {x.ticks(4).map((tick) => (
          <g key={tick}>
            <line
              x1={x(tick)}
              x2={x(tick)}
              y1={margin.top}
              y2={chartHeight - margin.bottom}
              className={styles.grid}
            />
            <text
              x={x(tick)}
              y={chartHeight - margin.bottom + 16}
              textAnchor="middle"
              className={styles.label}
            >
              {tick}
            </text>
          </g>
        ))}
        {stacked &&
          stackKeys.map((key, index) => (
            <g key={key} transform={`translate(${index * 80}, 10)`}>
              <circle cx={5} cy={0} r={5} fill={stackColors[index]} />
              <text x={14} y={4} className={styles.label}>
                {key}
              </text>
            </g>
          ))}
        {data.map((d) => (
          <g
            key={d.name}
            className={styles.slice}
            onMouseMove={(event) =>
              show(event, {
                title: d.name,
                items: d.parts.map((part, index) => ({
                  color: stacked ? stackColors[index] : colors[0],
                  label: stacked ? stackKeys[index] : "total",
                  value: part,
                })),
              })
            }
            onMouseLeave={hideTooltip}
          >
            <text
              x={labelWidth - 12}
              y={(y(d.name) ?? 0) + y.bandwidth() / 2 + 4}
              textAnchor="end"
              className={styles.label}
            >
              {d.name.length > maxChars ? `…${d.name.slice(-(maxChars - 1))}` : d.name}
            </text>
            {d.parts.map((part, index) => {
              const below = d.parts.slice(0, index).reduce((sum, value) => sum + value, 0);
              return (
                <Bar
                  key={index}
                  x={x(below)}
                  y={y(d.name)}
                  width={x(below + part) - x(below)}
                  height={y.bandwidth()}
                  rx={4}
                  fill={stacked ? stackColors[index] : colors[0]}
                />
              );
            })}
            <text
              x={x(d.total) + 8}
              y={(y(d.name) ?? 0) + y.bandwidth() / 2 + 4}
              className={styles.value}
            >
              {d.total}
            </text>
          </g>
        ))}
      </svg>
      {tooltip}
    </>
  );
};
