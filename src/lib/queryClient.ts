import { QueryClient } from "@tanstack/react-query";

const FIVE_MINUTES = 5 * 60 * 1000;
const THIRTY_MINUTES = 30 * 60 * 1000;

export const queryKeys = {
  home: {
    summary: ["home", "summary"] as const,
  },
  devices: {
    screen: ["devices", "screen"] as const,
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
