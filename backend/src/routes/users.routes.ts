import { Router } from 'express';
import {
  postUser,
  postLogin,
  getVerifyEmail,
  postResendVerification,
} from '../controllers/users.controller';
import { getClaimsByUserId } from '../controllers/claims.controller';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();
router.post('/', asyncHandler(postUser));
router.post('/login', asyncHandler(postLogin));
router.get('/verify-email', asyncHandler(getVerifyEmail));
router.post('/resend-verification', asyncHandler(postResendVerification));
router.get('/:userId/claims', asyncHandler(getClaimsByUserId));

export default router;
