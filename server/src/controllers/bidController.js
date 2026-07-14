import Listing from '../models/Listing.js';

export const placeBid = async (req, res) => {
  try {
    const { amount } = req.body;
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.type !== 'auction') {
      return res.status(400).json({ message: 'This listing is not an auction' });
    }

    if (listing.status !== 'active') {
      return res.status(400).json({ message: 'This auction has ended' });
    }

    if (listing.endDate && new Date() > new Date(listing.endDate)) {
      listing.status = 'ended';
      await listing.save();
      return res.status(400).json({ message: 'This auction has ended' });
    }

    if (listing.seller.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot bid on your own listing' });
    }

    const minBid = listing.currentBid + listing.bidIncrement;
    if (amount < minBid) {
      return res.status(400).json({
        message: `Bid must be at least ${minBid}`,
        minBid,
      });
    }

    listing.currentBid = amount;
    listing.bids.push({
      bidder: req.user._id,
      amount,
    });

    await listing.save();

    res.json({ listing });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
