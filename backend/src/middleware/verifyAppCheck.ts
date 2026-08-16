import { Request, Response, NextFunction } from 'express';
import { getAppCheck } from 'firebase-admin/app-check';

export const verifyAppCheck = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const appCheckToken = req.header('X-Firebase-AppCheck');

  if (!appCheckToken) {
    res.status(401).json({ error: 'Unauthorized: App Check token missing.' });
    return;
  }

  try {
    const appCheckClaims = await getAppCheck().verifyToken(appCheckToken);
    
    // You can optionally access appCheckClaims.app_id if needed
    // req.appCheckClaims = appCheckClaims;
    
    next();
  } catch (error) {
    console.error('App Check token verification failed:', error);
    res.status(401).json({ error: 'Unauthorized: Invalid App Check token.' });
    return;
  }
};
