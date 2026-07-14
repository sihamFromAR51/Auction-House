import axios from 'axios';
import { localAuth, localListings, localReviews, localOrders } from './local';
import { FALLBACK_CATEGORIES } from '../categories';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

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

async function orLocal(apiCall, localFallback) {
  try {
    const res = await apiCall();
    return res;
  } catch {
    return localFallback();
  }
}

export const auth = {
  register: async (data) => {
    try {
      return await api.post('/auth/register', data);
    } catch {
      return localAuth.register(data);
    }
  },
  login: async (data) => {
    try {
      return await api.post('/auth/login', data);
    } catch {
      return localAuth.login(data);
    }
  },
  getMe: async () => {
    const uid = getUserId();
    if (!uid) throw new Error('Not logged in');
    try {
      return await api.get('/auth/me');
    } catch {
      return localAuth.getMe(uid);
    }
  },
};

export const categories = {
  getAll: async () => {
    try {
      return await api.get('/categories');
    } catch {
      return { data: { categories: FALLBACK_CATEGORIES } };
    }
  },
  getBySlug: async (slug) => {
    const cat = FALLBACK_CATEGORIES.find((c) => c.slug === slug);
    try {
      return await api.get(`/categories/${slug}`);
    } catch {
      return { data: { category: cat || FALLBACK_CATEGORIES[0] } };
    }
  },
};

export const listings = {
  getAll: async (params) => {
    try {
      return await api.get('/listings', { params });
    } catch {
      let items = localListings.getAll();
      if (params?.category) items = items.filter((l) => l.category === params.category);
      if (params?.type) items = items.filter((l) => l.type === params.type);
      if (params?.search) {
        const q = params.search.toLowerCase();
        items = items.filter((l) => l.title?.toLowerCase().includes(q) || l.description?.toLowerCase().includes(q));
      }
      items = items.filter((l) => l.status === 'active');
      const sortMap = { oldest: 'createdAt', 'price-asc': 'price', 'price-desc': '-price', 'ending-soon': 'endDate' };
      const sortField = sortMap[params?.sort] || '-createdAt';
      if (sortField.startsWith('-')) items.sort((a, b) => new Date(b[sortField.slice(1)]) - new Date(a[sortField.slice(1)]));
      else items.sort((a, b) => new Date(a[sortField]) - new Date(b[sortField]));
      return { data: { listings: items, page: 1, pages: 1, total: items.length } };
    }
  },
  getById: async (id) => {
    try {
      return await api.get(`/listings/${id}`);
    } catch {
      const listing = localListings.getById(id);
      if (!listing) throw new Error('Not found');
      return { data: { listing } };
    }
  },
  create: async (data) => {
    const uid = getUserId();
    if (!uid) throw new Error('Login required');
    try {
      return await api.post('/listings', { ...data, seller: uid });
    } catch {
      const listing = localListings.create({ ...data, seller: uid });
      return { data: { listing } };
    }
  },
  getMy: async () => {
    const uid = getUserId();
    if (!uid) return { data: { listings: [] } };
    try {
      return await api.get('/listings/my');
    } catch {
      return { data: { listings: localListings.getBySeller(uid) } };
    }
  },
};

export const bids = {
  place: async (id, amount) => {
    const uid = getUserId();
    if (!uid) throw new Error('Login required');
    try {
      return await api.post(`/bids/${id}`, { amount });
    } catch {
      const listing = localListings.placeBid(id, uid, amount);
      return { data: { listing } };
    }
  },
};

export const orders = {
  create: async (data) => {
    const uid = getUserId();
    if (!uid) throw new Error('Login required');
    try {
      return await api.post('/orders', data);
    } catch {
      const order = localOrders.create({ ...data, buyer: uid });
      return { data: { order } };
    }
  },
  getMy: async () => {
    const uid = getUserId();
    if (!uid) return { data: { orders: [] } };
    try {
      return await api.get('/orders/my');
    } catch {
      return { data: { orders: localOrders.getByBuyer(uid) } };
    }
  },
  getSales: async () => {
    const uid = getUserId();
    if (!uid) return { data: { orders: [] } };
    try {
      return await api.get('/orders/sales');
    } catch {
      return { data: { orders: localOrders.getBySeller(uid) } };
    }
  },
  updateStatus: async (id, status) => {
    try {
      return await api.patch(`/orders/${id}/status`, { status });
    } catch {
      const order = localOrders.updateStatus(id, status);
      return { data: { order } };
    }
  },
};

export const reviews = {
  getBySeller: async (sellerId) => {
    try {
      return await api.get(`/reviews/${sellerId}`);
    } catch {
      return { data: { reviews: localReviews.getBySeller(sellerId) } };
    }
  },
  create: async ({ sellerId, listingId, rating, comment }) => {
    const uid = getUserId();
    const name = getUserName();
    try {
      return await api.post('/reviews', { sellerId, listingId, rating, comment });
    } catch {
      const review = localReviews.create({ sellerId, buyerId: uid, buyerName: name, listingId, rating, comment });
      return { data: { review } };
    }
  },
};

export const users = {
  getProfile: async (id) => {
    try {
      return await api.get(`/users/${id}`);
    } catch {
      const user = localAuth.getUser(id);
      if (!user) throw new Error('User not found');
      return { data: { user } };
    }
  },
};

export default api;
