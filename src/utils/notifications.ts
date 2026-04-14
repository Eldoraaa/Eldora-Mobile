import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { apiClient } from "@/services/api";
import { ENDPOINTS } from "@/constants/api";

// Tampilkan notifikasi saat app di foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerFCMToken(): Promise<void> {
  if (!Device.isDevice) {
    console.warn("[FCM] Harus menggunakan physical device");
    return;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("eldora-alerts", {
      name: "Eldora Alerts",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF8A7A",
      sound: "default",
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.warn("[FCM] Permission notifikasi ditolak");
    return;
  }

  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ??
    (Constants as any)?.easConfig?.projectId;

  if (!projectId) {
    console.warn("[FCM] Project ID tidak ditemukan di app.json. Token tidak didaftarkan.");
    return;
  }

  try {
    const { data: expoPushToken } = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    await apiClient.post(ENDPOINTS.REGISTER_FCM, { fcmToken: expoPushToken });
    console.log("[FCM] Token berhasil didaftarkan:", expoPushToken);
  } catch (err) {
    console.error("[FCM] Gagal mendaftarkan token:", err);
  }
}

export function setupNotificationListeners(): () => void {
  const receivedListener = Notifications.addNotificationReceivedListener(
    (notification) => {
      console.log("[FCM] Notifikasi diterima:", notification.request.content.title);
    }
  );

  const responseListener =
    Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      console.log("[FCM] Notifikasi di-tap, data:", data);
      // Fase 1: buka app di Home (default behavior)
    });

  return () => {
    receivedListener.remove();
    responseListener.remove();
  };
}
