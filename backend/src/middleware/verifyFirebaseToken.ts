import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../config/firebase.admin';

export interface AuthenticatedRequest extends Request {
  uid: string;
  email: string;
}

/**
 * Middleware: Verifies Firebase JWT token on every protected route.
 * Extracts the Bearer token from Authorization header, verifies it
 * with Firebase Admin SDK, and attaches uid + email to the request.
 */
export async function verifyFirebaseToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'No token provided. Include Authorization: Bearer <token>',
      });
      return;
    }

    const idToken = authHeader.split('Bearer ')[1];

    if (!idToken) {
      res.status(401).json({ error: 'Unauthorized', message: 'Token is empty' });
      return;
    }

    // Verify token with Firebase Admin SDK
    const decodedToken = await adminAuth().verifyIdToken(idToken, true);

    // Attach user info to request
    (req as AuthenticatedRequest).uid = decodedToken.uid;
    (req as AuthenticatedRequest).email = decodedToken.email || '';

    next();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Token verification failed';

    if (message.includes('auth/id-token-expired')) {
      res.status(401).json({ error: 'TokenExpired', message: 'Token has expired. Please re-authenticate.' });
    } else if (message.includes('auth/argument-error')) {
      res.status(401).json({ error: 'InvalidToken', message: 'Malformed token.' });
    } else {
      res.status(401).json({ error: 'Unauthorized', message });
    }
  }
}
