import { Router } from 'express';
import { getCategories, getCategoryBySlug, createCategory } from '../controllers/categoryController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();

router.get('/', getCategories);
router.get('/:slug', getCategoryBySlug);
router.post('/', protect, adminOnly, createCategory);

export default router;
