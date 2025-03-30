const baseUrl = "http://localhost:3000/api";

export const fetchy = async <T>(url): Promise<T | { data: false }> => {
  const res = await fetch(baseUrl + url);
  if (res.status === 204) return { data: false };

  return res.json();
};
