import { create } from 'zustand';
import { User as FirebaseUser } from 'firebase/auth';
import { User } from '../types/user.types';

interface AuthStore {
  firebaseUser: FirebaseUser | null;
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  setFirebaseUser: (firebaseUser: FirebaseUser | null) => void;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  firebaseUser: null,
  user: null,
  isLoading: true,
  isAuthenticated: false,

  setFirebaseUser: (firebaseUser) =>
    set({ firebaseUser, isAuthenticated: !!firebaseUser }),

  setUser: (user) => set({ user }),

  setLoading: (isLoading) => set({ isLoading }),

  reset: () =>
    set({ firebaseUser: null, user: null, isLoading: false, isAuthenticated: false }),
}));
