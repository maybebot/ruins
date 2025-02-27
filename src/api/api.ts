const baseUrl = "http://localhost:3000/api";

export const getErrors = async () => {
  const x = await fetch(`${baseUrl}/files?sortBy=error`);
  const y = await x.json();
  return y;
};

export const getGroupedErrors = async () => {
  const x = await fetch(`${baseUrl}/files?grouped=1`);
  const y = await x.json();
  return y;
};

export const getConfig = async () => {
  const x = await fetch(`${baseUrl}/config`);
  const res = await x.json();
  return res;
};
