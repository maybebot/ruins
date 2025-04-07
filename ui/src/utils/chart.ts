type DataList = Array<{
  name: string;
  total: number;
  selected: boolean;
}>;

const chartColors = ["#6a4aff", "#1fa96b", "#ff3366", "#3f5eff", "#d6aa00", "#ff5c00", "#ff1a1a"];

export const toChartData = (data: DataList, hovered: string) => {
  if (!data) return [];

  return data.map((d, i) => ({
    key: d.name,
    value: d.total,
    fill: `${chartColors[i % chartColors.length]}${hovered !== d.name ? "66" : ""}`, // apply opacity
  }));
};
