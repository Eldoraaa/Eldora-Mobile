import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "@/types/auth.types";

interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  isHydrated: boolean;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isLoading: false,
      isHydrated: false,
      setAuth: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
      setLoading: (isLoading) => set({ isLoading }),
      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: "eldora-auth",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ token: state.token, user: state.user }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);
