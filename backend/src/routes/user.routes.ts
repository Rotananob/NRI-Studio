import { Router } from 'express';
import { verifyFirebaseToken } from '../middleware/verifyFirebaseToken';
import { updateProfile, deleteAccount } from '../controllers/user.controller';

const router = Router();

router.use(verifyFirebaseToken);

// PATCH  /api/user/profile    — Update display name / avatar
router.patch('/profile', updateProfile);

// DELETE /api/user/account    — Delete user account + all data
router.delete('/account', deleteAccount);

export default router;
