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

export const localListings = {
  getAll: () => get(LISTINGS_KEY),
  getById: (id) => get(LISTINGS_KEY).find((l) => l._id === id) || null,
  create: (data) => {
    const listings = get(LISTINGS_KEY);
    const listing = {
      _id: Date.now().toString(),
      ...data,
      status: 'active',
      createdAt: new Date().toISOString(),
      currentBid: data.type === 'auction' ? data.startingBid : 0,
      bids: [],
    };
    listings.unshift(listing);
    set(LISTINGS_KEY, listings);
    return listing;
  },
  getBySeller: (sellerId) => get(LISTINGS_KEY).filter((l) => l.seller === sellerId),
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
