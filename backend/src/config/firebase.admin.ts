import { initializeApp, cert, getApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

let initialized = false;

export function initFirebaseAdmin(): void {
  if (initialized || getApps().length > 0) return;

  const {
    FIREBASE_PROJECT_ID,
    FIREBASE_PRIVATE_KEY_ID,
    FIREBASE_PRIVATE_KEY,
    FIREBASE_CLIENT_EMAIL,
    FIREBASE_CLIENT_ID,
    FIREBASE_AUTH_URI,
    FIREBASE_TOKEN_URI,
    FIREBASE_CLIENT_X509_CERT_URL,
  } = process.env;

  if (!FIREBASE_PROJECT_ID || !FIREBASE_PRIVATE_KEY || !FIREBASE_CLIENT_EMAIL) {
    throw new Error(
      '❌ Firebase Admin SDK credentials missing. Check your .env file.'
    );
  }

  const credential = cert({
    projectId: FIREBASE_PROJECT_ID,
    privateKeyId: FIREBASE_PRIVATE_KEY_ID,
    // Replace escaped newlines from .env string
    privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    clientEmail: FIREBASE_CLIENT_EMAIL,
    clientId: FIREBASE_CLIENT_ID,
    authUri: FIREBASE_AUTH_URI,
    tokenUri: FIREBASE_TOKEN_URI,
    clientCertUrl: FIREBASE_CLIENT_X509_CERT_URL,
  } as any);

  initializeApp({ credential });

  initialized = true;
  console.log('✅ Firebase Admin SDK initialized');
}

export const adminAuth = () => getAuth();

