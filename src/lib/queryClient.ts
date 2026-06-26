import { QueryClient } from "@tanstack/react-query";

const FIVE_MINUTES = 5 * 60 * 1000;
const THIRTY_MINUTES = 30 * 60 * 1000;

export const queryKeys = {
  home: {
    summary: ["home", "summary"] as const,
    safetySummary: ["home", "safety-summary"] as const,
    wellnessSummary: ["home", "wellness-summary"] as const,
    emergencyContacts: ["home", "emergency-contacts"] as const,
    homes: ["home", "homes"] as const,
    settings: (homeId: string | null | undefined) =>
      ["home", "settings", homeId ?? "default"] as const,
  },
  devices: {
    screen: (homeId?: string | null) =>
      ["devices", "screen", homeId ?? "default"] as const,
    roomCategories: (homeId?: string | null) =>
      ["devices", "room-categories", homeId ?? "default"] as const,
    voiceConfig: (deviceId: string) => ["devices", "voice-config", deviceId] as const,
  },
  notifications: {
    detail: (id?: string | null) => ["notifications", "detail", id ?? "default"] as const,
    list: (type?: string, homeId?: string | null) =>
      ["notifications", "list", type ?? "all", homeId ?? "default"] as const,
    preferences: ["notifications", "preferences"] as const,
  },
  scenes: {
    list: (homeId?: string | null, mode?: string, roomSlug?: string) =>
      ["scenes", homeId ?? "default", mode ?? "all", roomSlug ?? "all"] as const,
    detail: (sceneId?: string | null) =>
      ["scenes", "detail", sceneId ?? "default"] as const,
  },
  voice: {
    reminders: (homeId?: string | null) => ["voice", "reminders", homeId ?? "default"] as const,
    reminder: (reminderId?: string | null) => ["voice", "reminder", reminderId ?? "default"] as const,
    memoryFacts: (status = "candidate") => ["voice", "memory-facts", status] as const,
  },
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: FIVE_MINUTES,
      gcTime: THIRTY_MINUTES,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
});
