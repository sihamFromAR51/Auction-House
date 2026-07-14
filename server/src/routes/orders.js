import { Router } from 'express';
import {
  createOrder,
  getMyOrders,
  getSellerOrders,
  updateOrderStatus,
} from '../controllers/orderController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.post('/', protect, createOrder);
router.get('/my', protect, getMyOrders);
router.get('/sales', protect, getSellerOrders);
router.patch('/:id/status', protect, updateOrderStatus);

export default router;
