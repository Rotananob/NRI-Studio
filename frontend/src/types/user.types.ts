export interface User {
  uid: string;
  email: string;
  displayName: string;
  avatar?: string;
  plan: 'free' | 'pro';
  storageUsedBytes: number;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  firebaseUser: import('firebase/auth').User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}
