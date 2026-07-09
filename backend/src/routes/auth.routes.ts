import { Router } from 'express';
import { verifyFirebaseToken } from '../middleware/verifyFirebaseToken';
import { authRateLimiter } from '../middleware/rateLimiter';
import { syncUser, getMe } from '../controllers/auth.controller';

const router = Router();

// POST /api/auth/sync — Called after Firebase login to sync user to MongoDB
router.post('/sync', authRateLimiter, verifyFirebaseToken, syncUser);

// GET /api/auth/me — Get current user profile
router.get('/me', verifyFirebaseToken, getMe);

export default router;
