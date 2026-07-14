import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: 200,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: 5000,
  },
  images: [{
    type: String,
  }],
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required'],
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['fixed', 'auction'],
    required: [true, 'Listing type is required'],
  },
  price: {
    type: Number,
    min: 0,
    required: function () { return this.type === 'fixed'; },
  },
  startingBid: {
    type: Number,
    min: 0,
    required: function () { return this.type === 'auction'; },
  },
  currentBid: {
    type: Number,
    min: 0,
    default: function () { return this.startingBid; },
  },
  reservePrice: {
    type: Number,
    min: 0,
    default: 0,
  },
  bidIncrement: {
    type: Number,
    min: 0,
    default: function () {
      if (this.type === 'auction') return Math.max(10, Math.floor(this.startingBid * 0.05));
      return 0;
    },
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['active', 'ended', 'sold', 'cancelled'],
    default: 'active',
  },
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  bids: [{
    bidder: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    amount: Number,
    createdAt: { type: Date, default: Date.now },
  }],
}, {
  timestamps: true,
});

listingSchema.index({ status: 1, type: 1 });
listingSchema.index({ category: 1 });
listingSchema.index({ seller: 1 });
listingSchema.index({ title: 'text', description: 'text' });

export default mongoose.model('Listing', listingSchema);
