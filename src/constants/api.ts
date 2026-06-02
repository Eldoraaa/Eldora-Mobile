export const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  "https://eldora-backend-production.up.railway.app";

export const ENDPOINTS = {
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  GOOGLE_LOGIN: "/auth/google",
  DELETE_ACCOUNT: "/auth/me",
  HOME_SUMMARY: "/home/summary",
  HOMES: "/home/homes",
  DEVICES: "/devices",
  ROOM_CATEGORIES: "/devices/room-categories",
  DEVICE_MANAGEMENT: "/devices/management",
  PAIR_DEVICE: "/devices/pair",
  LOCAL_PAIR_DEVICE: "/devices/local-pair",
  PAIRING_REQUESTS: "/devices/pairing-requests",
  NOTIFICATIONS: "/notifications",
  NOTIFICATION_PREFERENCES: "/notifications/preferences",
  SCENES: "/scenes",
} as const;
