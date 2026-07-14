import Listing from '../models/Listing.js';
import Order from '../models/Order.js';

export const createOrder = async (req, res) => {
  try {
    const { listingId, paymentMethod, paymentNumber, transactionId, note } = req.body;

    const listing = await Listing.findById(listingId).populate('seller', 'name');

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.status !== 'active') {
      return res.status(400).json({ message: 'This item is no longer available' });
    }

    if (listing.seller._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot buy your own item' });
    }

    let amount;
    if (listing.type === 'fixed') {
      amount = listing.price;
    } else {
      if (listing.winner && listing.winner.toString() !== req.user._id.toString()) {
        return res.status(400).json({ message: 'This auction was won by another user' });
      }
      if (!listing.winner) {
        return res.status(400).json({ message: 'This auction has not ended yet' });
      }
      amount = listing.currentBid;
    }

    const order = await Order.create({
      listing: listing._id,
      buyer: req.user._id,
      seller: listing.seller._id,
      amount,
      paymentMethod,
      paymentNumber,
      transactionId: transactionId || '',
      note: note || '',
      status: 'pending',
    });

    listing.status = 'sold';
    await listing.save();

    res.status(201).json({ order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user._id })
      .populate('listing', 'title images price type currentBid')
      .populate('seller', 'name phone')
      .sort('-createdAt');
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSellerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ seller: req.user._id })
      .populate('listing', 'title images price type currentBid')
      .populate('buyer', 'name phone')
      .sort('-createdAt');
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    order.status = status;
    await order.save();

    res.json({ order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
