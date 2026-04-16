export const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

export const ENDPOINTS = {
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  GOOGLE_LOGIN: "/auth/google",
  REGISTER_FCM: "/auth/register-fcm-token",
  HOME_SUMMARY: "/home/summary",
  ALERTS: "/alerts",
} as const;
