import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { useAuthStore } from './store/authStore';
import { userApi } from './api/user.api';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import IDEPage from './pages/IDEPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoadingScreen from './components/ui/LoadingScreen';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

const App: React.FC = () => {
  const { setFirebaseUser, setUser, setLoading, isLoading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);

      if (firebaseUser) {
        try {
          // Sync with MongoDB backend
          const mongoUser = await userApi.sync({
            displayName: firebaseUser.displayName || undefined,
            avatar: firebaseUser.photoURL || undefined,
          });
          setUser(mongoUser);
        } catch (error) {
          console.error('Failed to sync user:', error);
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, [setFirebaseUser, setUser, setLoading]);

  if (isLoading) return <LoadingScreen />;

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <IDEPage />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/ide" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
