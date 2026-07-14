import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from '../models/Category.js';

dotenv.config();

const categories = [
  {
    name: 'Vintage Coins',
    slug: 'vintage-coins',
    description: 'Rare and collectible vintage coins from around the world',
  },
  {
    name: 'Special Serial Taka',
    slug: 'special-serial-taka',
    description: 'Bangladeshi Taka banknotes with unique and rare serial numbers',
  },
  {
    name: 'Old Cameras',
    slug: 'old-cameras',
    description: 'Vintage and classic cameras for collectors and enthusiasts',
  },
  {
    name: 'Collectibles',
    slug: 'collectibles',
    description: 'Various collectible items and memorabilia',
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');

    await Category.deleteMany({});
    console.log('Existing categories cleared');

    for (const cat of categories) {
      await Category.create(cat);
      console.log(`Created category: ${cat.name}`);
    }

    console.log('Categories seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
