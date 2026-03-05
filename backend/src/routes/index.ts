import { Router, Request, Response } from 'express';
import gamesRoutes from './games.routes';
import usersRoutes from './users.routes';
import claimsRoutes from './claims.routes';
import dealsRoutes from './deals.routes';

const router = Router();

router.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'LootRadar API is running' });
});

router.use('/games', gamesRoutes);
router.use('/users', usersRoutes);
router.use('/claims', claimsRoutes);
router.use('/deals', dealsRoutes);

export default router;
