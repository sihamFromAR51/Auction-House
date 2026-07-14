import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: true,
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  paymentMethod: {
    type: String,
    enum: ['bkash', 'nagad'],
    required: true,
  },
  paymentNumber: {
    type: String,
    required: true,
  },
  transactionId: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending',
  },
  note: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

orderSchema.index({ buyer: 1 });
orderSchema.index({ seller: 1 });
orderSchema.index({ listing: 1 });

export default mongoose.model('Order', orderSchema);
