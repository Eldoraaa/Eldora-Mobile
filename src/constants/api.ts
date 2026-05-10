export const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  "https://eldora-backend-production.up.railway.app";

export const ENDPOINTS = {
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  GOOGLE_LOGIN: "/auth/google",
  HOME_SUMMARY: "/home/summary",
  DEVICES: "/devices",
  PAIR_DEVICE: "/devices/pair",
  LOCAL_PAIR_DEVICE: "/devices/local-pair",
  PAIRING_REQUESTS: "/devices/pairing-requests",
} as const;
