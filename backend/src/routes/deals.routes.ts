import { Router } from 'express';
import { getDeals } from '../controllers/deals.controller';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();
router.get('/', asyncHandler(getDeals));

export default router;
