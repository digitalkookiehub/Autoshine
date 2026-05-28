import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isFirstLogin: boolean;
  hasSeenOnboarding: boolean;
  setUser: (user: User) => void;
  setIsLoading: (loading: boolean) => void;
  setIsFirstLogin: (value: boolean) => void;
  setHasSeenOnboarding: (value: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      isFirstLogin: false,
      hasSeenOnboarding: false,
      setUser: (user) => set({ user, isAuthenticated: true, isLoading: false }),
      setIsLoading: (isLoading) => set({ isLoading }),
      setIsFirstLogin: (isFirstLogin) => set({ isFirstLogin }),
      setHasSeenOnboarding: (hasSeenOnboarding) => set({ hasSeenOnboarding }),
      clearAuth: () =>
        set({ user: null, isAuthenticated: false, isLoading: false, isFirstLogin: false }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        hasSeenOnboarding: state.hasSeenOnboarding,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setIsLoading(false);
      },
    }
  )
);
