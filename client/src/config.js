export const imageUrl = (data) => {
  if (!data) return null;
  if (data.startsWith('data:') || data.startsWith('http')) return data;
  return null;
};
