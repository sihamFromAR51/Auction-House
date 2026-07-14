const USERS_KEY = 'ah_users';
const LISTINGS_KEY = 'ah_listings';
const REVIEWS_KEY = 'ah_reviews';
const ORDERS_KEY = 'ah_orders';

function get(key) {
  try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; }
}
function set(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

export const localAuth = {
  register: ({ name, email, phone, password }) => {
    const users = get(USERS_KEY);
    if (users.find((u) => u.email === email || u.phone === phone)) {
      throw { response: { data: { message: 'Email or phone already registered' } } };
    }
    const user = { _id: Date.now().toString(), name, email, phone, password, role: 'user', avatar: '', createdAt: new Date().toISOString() };
    users.push(user);
    set(USERS_KEY, users);
    const { password: _, ...safe } = user;
    const token = btoa(JSON.stringify({ id: user._id, exp: Date.now() + 604800000 }));
    return { data: { token, user: safe } };
  },
  login: ({ email, phone, password }) => {
    const users = get(USERS_KEY);
    const user = users.find((u) => (email ? u.email === email : u.phone === phone));
    if (!user || user.password !== password) {
      throw { response: { data: { message: 'Invalid credentials' } } };
    }
    const { password: _, ...safe } = user;
    const token = btoa(JSON.stringify({ id: user._id, exp: Date.now() + 604800000 }));
    return { data: { token, user: safe } };
  },
  getMe: (id) => {
    const users = get(USERS_KEY);
    const user = users.find((u) => u._id === id);
    if (!user) throw new Error('User not found');
    const { password: _, ...safe } = user;
    return { data: { user: safe } };
  },
  getUser: (id) => {
    if (!id) return null;
    const users = get(USERS_KEY);
    const user = users.find((u) => u._id === id);
    if (!user) return null;
    const { password: _, ...safe } = user;
    const reviews = get(REVIEWS_KEY).filter((r) => r.sellerId === id);
    return { ...safe, reviewCount: reviews.length, rating: reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : 0 };
  },
  updateProfile: (id, updates) => {
    const users = get(USERS_KEY);
    const idx = users.findIndex((u) => u._id === id);
    if (idx === -1) throw new Error('User not found');
    users[idx] = { ...users[idx], ...updates, password: users[idx].password };
    set(USERS_KEY, users);
    const { password: _, ...safe } = users[idx];
    return safe;
  },
};

function populateListing(listing) {
  if (!listing) return null;
  const users = get(USERS_KEY);
  const categories = [
    { _id: 'vintage-coins', name: 'Vintage Coins', slug: 'vintage-coins', description: 'Rare and collectible vintage coins from around the world' },
    { _id: 'special-serial-taka', name: 'Special Serial Taka', slug: 'special-serial-taka', description: 'Bangladeshi Taka banknotes with unique and rare serial numbers' },
    { _id: 'old-cameras', name: 'Old Cameras', slug: 'old-cameras', description: 'Vintage and classic cameras for collectors and enthusiasts' },
    { _id: 'collectibles', name: 'Collectibles', slug: 'collectibles', description: 'Various collectible items and memorabilia' },
  ];
  const sellerId = typeof listing.seller === 'object' ? listing.seller?._id : listing.seller;
  const seller = users.find((u) => u._id === sellerId);
  const cat = categories.find((c) => c._id === listing.category);
  return {
    ...listing,
    seller: seller ? { _id: seller._id, name: seller.name, avatar: seller.avatar } : { _id: sellerId, name: 'Unknown' },
    category: cat || { _id: listing.category, name: listing.category, slug: listing.category },
  };
}

export const localListings = {
  getAll: () => get(LISTINGS_KEY).map(populateListing),
  getById: (id) => populateListing(get(LISTINGS_KEY).find((l) => l._id === id)) || null,
  create: (data) => {
    const listings = get(LISTINGS_KEY);
    const sellerId = typeof data.seller === 'object' ? data.seller?._id : data.seller;
    const listing = {
      _id: Date.now().toString(),
      ...data,
      seller: sellerId,
      status: 'active',
      createdAt: new Date().toISOString(),
      currentBid: data.type === 'auction' ? (data.startingBid || 0) : 0,
      bids: [],
    };
    listings.unshift(listing);
    set(LISTINGS_KEY, listings);
    return populateListing(listing);
  },
  getBySeller: (sellerId) => get(LISTINGS_KEY).filter((l) => {
    const sid = typeof l.seller === 'object' ? l.seller?._id : l.seller;
    return sid === sellerId;
  }).map(populateListing),
  placeBid: (id, bidderId, amount) => {
    const listings = get(LISTINGS_KEY);
    const idx = listings.findIndex((l) => l._id === id);
    if (idx === -1) throw new Error('Listing not found');
    const listing = listings[idx];
    if (listing.type !== 'auction') throw new Error('Not an auction');
    if (listing.status !== 'active') throw new Error('Auction ended');
    const minBid = listing.currentBid + (listing.bidIncrement || Math.max(10, Math.floor(listing.startingBid * 0.05)));
    if (amount < minBid) throw new Error(`Bid must be at least ${minBid}`);
    listing.currentBid = amount;
    listing.bids.push({ bidder: bidderId, amount, createdAt: new Date().toISOString() });
    listings[idx] = listing;
    set(LISTINGS_KEY, listings);
    return listing;
  },
};

export const localReviews = {
  getBySeller: (sellerId) => get(REVIEWS_KEY).filter((r) => r.sellerId === sellerId),
  create: ({ sellerId, buyerId, buyerName, listingId, rating, comment }) => {
    const reviews = get(REVIEWS_KEY);
    const review = { _id: Date.now().toString(), sellerId, buyerId, buyerName, listingId, rating, comment, createdAt: new Date().toISOString() };
    reviews.push(review);
    set(REVIEWS_KEY, reviews);
    return review;
  },
};

export const localOrders = {
  getByBuyer: (buyerId) => get(ORDERS_KEY).filter((o) => o.buyer === buyerId),
  getBySeller: (sellerId) => get(ORDERS_KEY).filter((o) => o.seller === sellerId),
  create: (data) => {
    const orders = get(ORDERS_KEY);
    const order = { _id: Date.now().toString(), ...data, status: 'pending', createdAt: new Date().toISOString() };
    orders.push(order);
    set(ORDERS_KEY, orders);
    const listings = get(LISTINGS_KEY);
    const lIdx = listings.findIndex((l) => l._id === data.listing);
    if (lIdx > -1) { listings[lIdx].status = 'sold'; set(LISTINGS_KEY, listings); }
    return order;
  },
  updateStatus: (id, status) => {
    const orders = get(ORDERS_KEY);
    const idx = orders.findIndex((o) => o._id === id);
    if (idx > -1) { orders[idx].status = status; set(ORDERS_KEY, orders); }
    return orders[idx];
  },
};
