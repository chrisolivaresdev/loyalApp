import { User } from '@/api/auth';
import { Platform } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist, StateStorage } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  setUser: (user: User) => void;
  clear: () => void;
}

const storage: StateStorage = {
  getItem: (name) => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(name);
    }
    return null;
  },
  setItem: (name, value) => {
    if (Platform.OS === 'web') {
      localStorage.setItem(name, value);
    }
  },
  removeItem: (name) => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(name);
    }
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clear: () => set({ user: null }),
    }),
    {
      name: 'auth',
      storage: createJSONStorage(() => storage),
    }
  )
);
