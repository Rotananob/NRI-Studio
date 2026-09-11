import axios from 'axios';
import { auth, appCheck } from '../firebase';
import { getToken } from 'firebase/app-check';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
  timeout: 15000,
});

// ── Request Interceptor — Attach Firebase JWT on every request ──
apiClient.interceptors.request.use(
  async (config) => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        const token = await currentUser.getIdToken(false); // don't force refresh unless expired
        config.headers.Authorization = `Bearer ${token}`;
      } catch (err) {
        console.error('Failed to get Firebase token:', err);
      }
    }
    
    if (appCheck) {
      try {
        const appCheckTokenResponse = await getToken(appCheck, false);
        config.headers['X-Firebase-AppCheck'] = appCheckTokenResponse.token;
      } catch (err) {
        // App Check token failed — continue without it (backend will reject if enforced)
        console.warn('App Check token error (non-fatal):', err);
      }
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor — Handle 401 (token expired) ──
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Force refresh the token and retry once
        const currentUser = auth.currentUser;
        if (currentUser) {
          const freshToken = await currentUser.getIdToken(true);
          originalRequest.headers.Authorization = `Bearer ${freshToken}`;
          return apiClient(originalRequest);
        }
      } catch {
        // Token refresh failed — user needs to re-login
        await auth.signOut();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
