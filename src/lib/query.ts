export const queryParams = (filters: Record<string, unknown>) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') params.set(key, JSON.stringify(value));
  });
  return params;
};
