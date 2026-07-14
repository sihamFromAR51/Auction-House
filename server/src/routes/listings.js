import { Router } from 'express';
import {
  getListings,
  getListing,
  createListing,
  getMyListings,
} from '../controllers/listingController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/', getListings);
router.get('/my', protect, getMyListings);
router.get('/:id', getListing);
router.post('/', protect, createListing);

export default router;
