export const FALLBACK_CATEGORIES = [
  { _id: 'vintage-coins', name: 'Vintage Coins', slug: 'vintage-coins', description: 'Rare and collectible vintage coins from around the world', icon: '🪙' },
  { _id: 'special-serial-taka', name: 'Special Serial Taka', slug: 'special-serial-taka', description: 'Bangladeshi Taka banknotes with unique and rare serial numbers', icon: '💵' },
  { _id: 'old-cameras', name: 'Old Cameras', slug: 'old-cameras', description: 'Vintage and classic cameras for collectors and enthusiasts', icon: '📷' },
  { _id: 'collectibles', name: 'Collectibles', slug: 'collectibles', description: 'Various collectible items and memorabilia', icon: '🏆' },
];

export function getCategory(idOrSlug) {
  return FALLBACK_CATEGORIES.find((c) => c._id === idOrSlug || c.slug === idOrSlug) || null;
}
