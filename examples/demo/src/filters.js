export function filterStatuses(statuses) {
  const unusedCount = statuses.length;
  console.info("Filtering statuses");
  return statuses.filter((status) => status !== "");
}
