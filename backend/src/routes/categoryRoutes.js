import express from 'express';
import * as categoryController from '../controllers/categoryController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticate, categoryController.createCategoryHandler);
router.get('/', authenticate, categoryController.getCategoriesHandler);
router.get('/stats', authenticate, categoryController.getCategoryStatsHandler);
router.get('/:id', authenticate, categoryController.getCategoryHandler);
router.patch('/:id', authenticate, categoryController.updateCategoryHandler);
router.delete('/:id', authenticate, categoryController.deleteCategoryHandler);

export default router;
