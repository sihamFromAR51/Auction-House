import axios from 'axios';
import { localAuth, localListings, localReviews, localOrders } from './local';
import { FALLBACK_CATEGORIES } from '../categories';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 4000,
});

let backendOnline = null;
async function checkBackend() {
  if (backendOnline !== null) return backendOnline;
  try {
    await api.get('/health', { timeout: 2000 });
    backendOnline = true;
  } catch {
    backendOnline = false;
  }
  return backendOnline;
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function getUserId() {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?._id;
  } catch { return null; }
}

function getUserName() {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?.name;
  } catch { return null; }
}

async function tryApi(apiCall, fallback) {
  if (backendOnline === false) return fallback();
  try {
    const res = await apiCall();
    backendOnline = true;
    return res;
  } catch {
    backendOnline = false;
    return fallback();
  }
}

export const auth = {
  register: async (data) => tryApi(() => api.post('/auth/register', data), () => localAuth.register(data)),
  login: async (data) => tryApi(() => api.post('/auth/login', data), () => localAuth.login(data)),
  getMe: async () => {
    const uid = getUserId();
    if (!uid) throw new Error('Not logged in');
    return tryApi(() => api.get('/auth/me'), () => localAuth.getMe(uid));
  },
};

export const categories = {
  getAll: async () => tryApi(() => api.get('/categories'), () => ({ data: { categories: FALLBACK_CATEGORIES } })),
  getBySlug: async (slug) => {
    const cat = FALLBACK_CATEGORIES.find((c) => c.slug === slug || c._id === slug);
    return tryApi(() => api.get(`/categories/${slug}`), () => ({ data: { category: cat || FALLBACK_CATEGORIES[0] } }));
  },
};

export const listings = {
  getAll: async (params) => tryApi(() => api.get('/listings', { params }), () => {
    let items = localListings.getAll();
    if (params?.category) items = items.filter((l) => l.category?.slug === params.category || l.category?._id === params.category);
    if (params?.type) items = items.filter((l) => l.type === params.type);
    if (params?.search) {
      const q = params.search.toLowerCase();
      items = items.filter((l) => l.title?.toLowerCase().includes(q) || l.description?.toLowerCase().includes(q));
    }
    if (params?.seller) items = items.filter((l) => l.seller?._id === params.seller || l.seller === params.seller);
    items = items.filter((l) => l.status === 'active');
    const sortMap = { newest: '-createdAt', oldest: 'createdAt', 'price-asc': 'price', 'price-desc': '-price', 'ending-soon': 'endDate' };
    const sortField = sortMap[params?.sort] || '-createdAt';
    if (sortField.startsWith('-')) items.sort((a, b) => new Date(b[sortField.slice(1)]) - new Date(a[sortField.slice(1)]));
    else items.sort((a, b) => new Date(a[sortField]) - new Date(b[sortField]));
    return { data: { listings: items, page: 1, pages: 1, total: items.length } };
  }),
  getById: async (id) => tryApi(() => api.get(`/listings/${id}`), () => {
    const listing = localListings.getById(id);
    if (!listing) throw new Error('Not found');
    return { data: { listing } };
  }),
  create: async (data) => {
    const uid = getUserId();
    if (!uid) throw new Error('Login required');
    return tryApi(() => api.post('/listings', { ...data, seller: uid }), () => {
      const listing = localListings.create({ ...data, seller: uid });
      return { data: { listing } };
    });
  },
  update: async (id, data) => {
    const uid = getUserId();
    if (!uid) throw new Error('Login required');
    return tryApi(() => api.put(`/listings/${id}`, data), () => {
      const listing = localListings.update(id, { ...data, seller: uid });
      return { data: { listing } };
    });
  },
  'delete': async (id) => tryApi(() => api.delete(`/listings/${id}`), () => {
    localListings.delete(id);
    return { data: { success: true } };
  }),
  getMy: async () => {
    const uid = getUserId();
    if (!uid) return { data: { listings: [] } };
    return tryApi(() => api.get('/listings/my'), () => ({ data: { listings: localListings.getBySeller(uid) } }));
  },
};

export const bids = {
  place: async (id, amount) => {
    const uid = getUserId();
    if (!uid) throw new Error('Login required');
    return tryApi(() => api.post(`/bids/${id}`, { amount }), () => {
      const listing = localListings.placeBid(id, uid, amount);
      return { data: { listing } };
    });
  },
};

export const orders = {
  create: async (data) => {
    const uid = getUserId();
    if (!uid) throw new Error('Login required');
    return tryApi(() => api.post('/orders', data), () => {
      const order = localOrders.create({ ...data, buyer: uid });
      return { data: { order } };
    });
  },
  getMy: async () => {
    const uid = getUserId();
    if (!uid) return { data: { orders: [] } };
    return tryApi(() => api.get('/orders/my'), () => ({ data: { orders: localOrders.getByBuyer(uid) } }));
  },
  getSales: async () => {
    const uid = getUserId();
    if (!uid) return { data: { orders: [] } };
    return tryApi(() => api.get('/orders/sales'), () => ({ data: { orders: localOrders.getBySeller(uid) } }));
  },
  updateStatus: async (id, status) => tryApi(() => api.patch(`/orders/${id}/status`, { status }), () => {
    const order = localOrders.updateStatus(id, status);
    return { data: { order } };
  }),
};

export const reviews = {
  getBySeller: async (sellerId) => tryApi(() => api.get(`/reviews/${sellerId}`), () => ({ data: { reviews: localReviews.getBySeller(sellerId) } })),
  create: async ({ sellerId, listingId, rating, comment }) => {
    const uid = getUserId();
    const name = getUserName();
    return tryApi(() => api.post('/reviews', { sellerId, listingId, rating, comment }), () => {
      const review = localReviews.create({ sellerId, buyerId: uid, buyerName: name, listingId, rating, comment });
      return { data: { review } };
    });
  },
};

export const users = {
  getProfile: async (id) => tryApi(() => api.get(`/users/${id}`), () => {
    const user = localAuth.getUser(id);
    if (!user) throw new Error('User not found');
    return { data: { user } };
  }),
  updateProfile: async (id, updates) => tryApi(() => api.patch(`/users/${id}`, updates), () => {
    const user = localAuth.updateProfile(id, updates);
    return { data: { user } };
  }),
};

export default api;
