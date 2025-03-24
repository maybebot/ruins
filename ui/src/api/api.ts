const baseUrl = "http://localhost:3000/api";

export const getErrors = async () => {
  const res = await fetch(`${baseUrl}/files?sortBy=error`);
  if (res.status === 204) return { data: false };

  return res.json();
};

export const getGroupedErrors = async () => {
  const res = await fetch(`${baseUrl}/files?grouped=1`);
  if (res.status === 204) return { data: false };

  return res.json();
};

export const getConfig = async () => {
  const res = await fetch(`${baseUrl}/config`);
  return res.json();
};
