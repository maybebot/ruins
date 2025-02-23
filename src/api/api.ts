export const getErrors = async () => {
  const x = await fetch("http://localhost:3000/api/files?sortBy=error");
  const y = await x.json();
  return y;
};

export const getGroupedErrors = async () => {
  const x = await fetch("http://localhost:3000/api/files?grouped=1");
  const y = await x.json();
  return y;
};
