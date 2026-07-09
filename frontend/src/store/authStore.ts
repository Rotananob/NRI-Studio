import { create } from 'zustand';
import { User as FirebaseUser } from 'firebase/auth';
import { User } from '../types/user.types';

interface AuthStore {
  firebaseUser: FirebaseUser | null;
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isGuest: boolean;

  setFirebaseUser: (firebaseUser: FirebaseUser | null) => void;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setGuest: (isGuest: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  firebaseUser: null,
  user: null,
  isLoading: true,
  isAuthenticated: false,
  isGuest: false,

  setFirebaseUser: (firebaseUser) =>
    set({ firebaseUser, isAuthenticated: !!firebaseUser, isGuest: false }),

  setUser: (user) => set({ user }),

  setLoading: (isLoading) => set({ isLoading }),

  setGuest: (isGuest) => set({ isGuest, isAuthenticated: false, firebaseUser: null, user: null }),

  reset: () =>
    set({ firebaseUser: null, user: null, isLoading: false, isAuthenticated: false, isGuest: false }),
}));
