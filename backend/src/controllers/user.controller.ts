import { Request, Response } from 'express';
import { User } from '../models/User.model';
import { Project } from '../models/File.model';
import { AuthenticatedRequest } from '../middleware/verifyFirebaseToken';
import { z } from 'zod';

const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(60).trim().optional(),
  avatar: z.string().url().optional().or(z.literal('')),
});

export async function updateProfile(req: Request, res: Response): Promise<void> {
  try {
    const { uid } = req as AuthenticatedRequest;

    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'ValidationError', details: parsed.error.flatten() });
      return;
    }

    const user = await User.findOneAndUpdate(
      { uid },
      { $set: parsed.data },
      { new: true }
    ).lean();

    if (!user) {
      res.status(404).json({ error: 'NotFound', message: 'User not found' });
      return;
    }

    res.json({ message: 'Profile updated', displayName: user.displayName, avatar: user.avatar });
  } catch (error) {
    console.error('updateProfile error:', error);
    res.status(500).json({ error: 'InternalError', message: 'Failed to update profile' });
  }
}

export async function deleteAccount(req: Request, res: Response): Promise<void> {
  try {
    const { uid } = req as AuthenticatedRequest;

    // Delete all user projects + user record
    await Promise.all([
      Project.deleteMany({ ownerId: uid }),
      User.deleteOne({ uid }),
    ]);

    res.json({ message: 'Account and all data deleted permanently' });
  } catch (error) {
    console.error('deleteAccount error:', error);
    res.status(500).json({ error: 'InternalError', message: 'Failed to delete account' });
  }
}
