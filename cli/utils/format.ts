export default (results: any) => {
  const res = results
    .filter((r: any) => r.messages.length > 0)
    .map((r: any) => ({ ...r, source: undefined }));
  return JSON.stringify({ issues: res }, null, 2);
};
// TODO: remove anys
