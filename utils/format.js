export default (results, context) => {
  const res = results
    .filter((r) => r.messages.length > 0)
    .map((r) => ({ ...r, source: undefined }));
  return JSON.stringify({ issues: res }, null, 2);
};
