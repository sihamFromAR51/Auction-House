import Listing from '../models/Listing.js';

export const getListings = async (req, res) => {
  try {
    const { category, type, status, search, sort, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (type) filter.type = type;
    if (status) filter.status = status;
    else filter.status = 'active';
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const sortOption = sort === 'oldest' ? { createdAt: 1 }
      : sort === 'price-asc' ? { price: 1 }
      : sort === 'price-desc' ? { price: -1 }
      : sort === 'ending-soon' ? { endDate: 1 }
      : { createdAt: -1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [listings, total] = await Promise.all([
      Listing.find(filter)
        .populate('seller', 'name avatar')
        .populate('category', 'name slug')
        .sort(sortOption)
        .skip(skip)
        .limit(parseInt(limit)),
      Listing.countDocuments(filter),
    ]);

    res.json({
      listings,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('seller', 'name email phone avatar createdAt')
      .populate('category', 'name slug')
      .populate('bids.bidder', 'name');

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    res.json({ listing });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createListing = async (req, res) => {
  try {
    const {
      title, description, category, type,
      price, startingBid, reservePrice, bidIncrement,
      startDate, endDate, images,
    } = req.body;

    const listingData = {
      title,
      description,
      category,
      seller: req.user._id,
      type,
      images: images || [],
    };

    if (type === 'fixed') {
      listingData.price = price;
    } else {
      listingData.startingBid = startingBid;
      listingData.currentBid = startingBid;
      listingData.reservePrice = reservePrice || 0;
      listingData.bidIncrement = bidIncrement || Math.max(10, Math.floor(startingBid * 0.05));
      listingData.startDate = startDate || new Date();
      listingData.endDate = endDate;
    }

    const listing = await Listing.create(listingData);
    res.status(201).json({ listing });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyListings = async (req, res) => {
  try {
    const listings = await Listing.find({ seller: req.user._id })
      .populate('category', 'name slug')
      .sort('-createdAt');
    res.json({ listings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
