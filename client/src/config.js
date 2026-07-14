export const imageUrl = (data) => {
  if (!data) return null;
  if (data.startsWith('data:') || data.startsWith('http://') || data.startsWith('https://')) return data;
  if (data.startsWith('/')) return data;
  return null;
};

let recentlyViewedCache = [];
export function trackView(listing) {
  if (!listing?._id) return;
  recentlyViewedCache = recentlyViewedCache.filter((l) => l._id !== listing._id);
  recentlyViewedCache.unshift(listing);
  if (recentlyViewedCache.length > 20) recentlyViewedCache.pop();
  try { localStorage.setItem('ah_recent', JSON.stringify(recentlyViewedCache)); } catch {}
}

export function getRecentViews() {
  if (recentlyViewedCache.length) return recentlyViewedCache;
  try {
    recentlyViewedCache = JSON.parse(localStorage.getItem('ah_recent')) || [];
    return recentlyViewedCache;
  } catch { return []; }
}

export function getViewedCategoryIds() {
  const items = getRecentViews();
  const counts = {};
  for (const item of items) {
    const id = item.category?._id || item.category;
    if (id) counts[id] = (counts[id] || 0) + 1;
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([id]) => id);
}
