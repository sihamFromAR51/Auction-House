import { Router } from 'express';
import { placeBid } from '../controllers/bidController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.post('/:id', protect, placeBid);

export default router;
