import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

const memoryStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

type HomeState = {
  selectedHomeId: string | null;
  setSelectedHomeId: (homeId: string | null) => void;
};

export const useHomeStore = create<HomeState>()(
  persist(
    (set) => ({
      selectedHomeId: null,
      setSelectedHomeId: (selectedHomeId) => set({ selectedHomeId }),
    }),
    {
      name: "eldora-home",
      storage: createJSONStorage(() =>
        typeof window === "undefined" ? memoryStorage : AsyncStorage
      ),
      partialize: (state) => ({ selectedHomeId: state.selectedHomeId }),
    }
  )
);
