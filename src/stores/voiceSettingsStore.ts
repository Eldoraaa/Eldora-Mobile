import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type VoiceLanguage = "en" | "id";
export type VoiceSpeed = "slow" | "normal" | "fast";

interface VoiceSettingsState {
  enabled: boolean;
  language: VoiceLanguage;
  speed: VoiceSpeed;
  setEnabled: (enabled: boolean) => void;
  setLanguage: (language: VoiceLanguage) => void;
  setSpeed: (speed: VoiceSpeed) => void;
}

export const useVoiceSettingsStore = create<VoiceSettingsState>()(
  persist(
    (set) => ({
      enabled: true,
      language: "en",
      speed: "normal",
      setEnabled: (enabled) => set({ enabled }),
      setLanguage: (language) => set({ language }),
      setSpeed: (speed) => set({ speed }),
    }),
    {
      name: "eldora-voice-settings",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
