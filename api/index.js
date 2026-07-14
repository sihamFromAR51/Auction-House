import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import Category from '../server/src/models/Category.js';
import authRoutes from '../server/src/routes/auth.js';
import categoryRoutes from '../server/src/routes/categories.js';
import listingRoutes from '../server/src/routes/listings.js';
import bidRoutes from '../server/src/routes/bids.js';
import orderRoutes from '../server/src/routes/orders.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/bids', bidRoutes);
app.use('/api/orders', orderRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/seed', async (req, res) => {
  try {
    const existing = await Category.countDocuments();
    if (existing > 0) {
      return res.json({ message: `Already seeded (${existing} categories)`, count: existing });
    }
    const cats = [
      { name: 'Vintage Coins', slug: 'vintage-coins', description: 'Rare and collectible vintage coins from around the world' },
      { name: 'Special Serial Taka', slug: 'special-serial-taka', description: 'Bangladeshi Taka banknotes with unique and rare serial numbers' },
      { name: 'Old Cameras', slug: 'old-cameras', description: 'Vintage and classic cameras for collectors and enthusiasts' },
      { name: 'Collectibles', slug: 'collectibles', description: 'Various collectible items and memorabilia' },
    ];
    await Category.insertMany(cats);
    res.status(201).json({ message: 'Seeded successfully', categories: cats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

let cachedDb = null;
async function connectDB() {
  if (cachedDb) return;
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    cachedDb = mongoose.connection;
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
  }
}

let connecting = false;
app.use(async (req, res, next) => {
  if (!cachedDb && !connecting && req.path.startsWith('/api') && req.path !== '/api/health') {
    connecting = true;
    await connectDB();
  }
  next();
});

export default app;
