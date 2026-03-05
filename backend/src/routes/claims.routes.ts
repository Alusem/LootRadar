import { Router } from 'express';
import { postClaim } from '../controllers/claims.controller';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();
router.post('/', asyncHandler(postClaim));

export default router;
