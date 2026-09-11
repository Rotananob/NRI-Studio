import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeAppCheck, ReCaptchaEnterpriseProvider, AppCheck } from 'firebase/app-check';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

// Initialize Firebase App Check with reCAPTCHA Enterprise
// Wrapped in try/catch so that if reCAPTCHA fails (e.g. key missing,
// domain not registered), the app still loads instead of crashing.
let appCheck: AppCheck | null = null;
try {
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LeUaYktAAAAAKbD8jL5xWhQkAVPbofN9LqZxjEe';
  appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider(siteKey),
    isTokenAutoRefreshEnabled: true,
  });
} catch (e) {
  console.warn('Firebase App Check initialization failed. Continuing without it.', e);
}

export { appCheck };
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export default app;

