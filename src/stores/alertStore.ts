import { create } from "zustand";
import { Alert } from "@/types/alert.types";

interface AlertState {
  alerts: Alert[];
  isLoading: boolean;
  lastFetched: string | null;
  setAlerts: (alerts: Alert[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useAlertStore = create<AlertState>()((set) => ({
  alerts: [],
  isLoading: false,
  lastFetched: null,
  setAlerts: (alerts) =>
    set({ alerts, lastFetched: new Date().toISOString() }),
  setLoading: (isLoading) => set({ isLoading }),
}));
