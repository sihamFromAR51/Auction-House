import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
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
