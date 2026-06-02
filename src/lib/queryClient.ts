import { QueryClient } from "@tanstack/react-query";

const FIVE_MINUTES = 5 * 60 * 1000;
const THIRTY_MINUTES = 30 * 60 * 1000;

export const queryKeys = {
  home: {
    summary: ["home", "summary"] as const,
    homes: ["home", "homes"] as const,
    settings: (homeId: string | null | undefined) =>
      ["home", "settings", homeId ?? "default"] as const,
  },
  devices: {
    screen: ["devices", "screen"] as const,
    roomCategories: (homeId?: string | null) =>
      ["devices", "room-categories", homeId ?? "default"] as const,
  },
  notifications: {
    list: (type?: string) => ["notifications", "list", type ?? "all"] as const,
    preferences: ["notifications", "preferences"] as const,
  },
  scenes: {
    list: (homeId?: string | null, mode?: string, roomSlug?: string) =>
      ["scenes", homeId ?? "default", mode ?? "all", roomSlug ?? "all"] as const,
    detail: (sceneId?: string | null) =>
      ["scenes", "detail", sceneId ?? "default"] as const,
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
