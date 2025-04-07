type DataList = Array<{
  name: string;
  total: number;
  selected: boolean;
}>;

const chartColors = ["#6a4aff", "#1fa96b", "#ff3366", "#3f5eff", "#d6aa00", "#ff5c00", "#ff1a1a"];

export const toChartData = (data: DataList, hovered: string, limit = 6) => {
  if (!data) return [];

  const chartedData = data.map((d, i) => ({
    key: d.name,
    value: d.total,
    fill: `${chartColors[i % chartColors.length]}${hovered !== d.name ? "66" : ""}`, // apply opacity
  }));
  if (chartedData.length <= limit) {
    return chartedData;
  }
  const returnedPart = chartedData.slice(0, limit);
  const remaining = chartedData.slice(limit, chartedData.length).reduce((acc, curr) => acc + curr.value, 0);
  return [...returnedPart, { key: "other", value: remaining }];
};
