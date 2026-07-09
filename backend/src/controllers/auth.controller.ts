import { Request, Response } from 'express';
import { User } from '../models/User.model';
import { AuthenticatedRequest } from '../middleware/verifyFirebaseToken';

/**
 * POST /api/auth/sync
 * Called immediately after Firebase login/registration.
 * Creates or updates the MongoDB user record.
 */
export async function syncUser(req: Request, res: Response): Promise<void> {
  try {
    const { uid, email } = req as AuthenticatedRequest;
    const { displayName, avatar } = req.body;

    const user = await User.findOneAndUpdate(
      { uid },
      {
        uid,
        email,
        displayName: displayName || email.split('@')[0],
        avatar: avatar || '',
        lastLoginAt: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
      message: 'User synced successfully',
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        avatar: user.avatar,
        plan: user.plan,
        storageUsedBytes: user.storageUsedBytes,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('syncUser error:', error);
    res.status(500).json({ error: 'InternalError', message: 'Failed to sync user' });
  }
}

/**
 * GET /api/auth/me
 * Returns the current authenticated user's profile.
 */
export async function getMe(req: Request, res: Response): Promise<void> {
  try {
    const { uid } = req as AuthenticatedRequest;

    const user = await User.findOne({ uid }).lean();

    if (!user) {
      res.status(404).json({ error: 'NotFound', message: 'User not found. Please sync first.' });
      return;
    }

    res.status(200).json({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      avatar: user.avatar,
      plan: user.plan,
      storageUsedBytes: user.storageUsedBytes,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error('getMe error:', error);
    res.status(500).json({ error: 'InternalError', message: 'Failed to fetch user' });
  }
}
