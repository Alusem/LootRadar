import { Router } from 'express';
import { getGames } from '../controllers/games.controller';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();
router.get('/', asyncHandler(getGames));

export default router;
