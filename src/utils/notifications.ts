import * as Device from "expo-device";
import Constants, { ExecutionEnvironment } from "expo-constants";
import { Platform } from "react-native";
import { apiClient } from "@/services/api";
import { ENDPOINTS } from "@/constants/api";

type NotificationsModule = typeof import("expo-notifications");

let notificationHandlerInitialized = false;

function canUseNotificationsModule(): boolean {
  return !(
    Platform.OS === "web" ||
    (Platform.OS === "android" &&
      Constants.executionEnvironment === ExecutionEnvironment.StoreClient)
  );
}

async function getNotificationsModule(): Promise<NotificationsModule | null> {
  if (!canUseNotificationsModule()) {
    return null;
  }

  const Notifications = await import("expo-notifications");

  if (!notificationHandlerInitialized) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
    notificationHandlerInitialized = true;
  }

  return Notifications;
}

function getPermissionStatus(permission: unknown) {
  const value = permission as { status?: string; granted?: boolean };
  return value.status ?? (value.granted ? "granted" : "denied");
}

export async function registerFCMToken(): Promise<void> {
  if (!Device.isDevice) {
    console.warn("[FCM] Must use a physical device");
    return;
  }

  const Notifications = await getNotificationsModule();
  if (!Notifications) {
    console.warn(
      "[FCM] Android push notifications are not available in Expo Go. Use a development build to register token."
    );
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

  const existingStatus = getPermissionStatus(
    await Notifications.getPermissionsAsync()
  );
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    finalStatus = getPermissionStatus(
      await Notifications.requestPermissionsAsync()
    );
  }

  if (finalStatus !== "granted") {
    console.warn("[FCM] Notification permission denied");
    return;
  }

  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ??
    (Constants as any)?.easConfig?.projectId;

  if (!projectId) {
    console.warn("[FCM] Project ID not found in app.json. Token not registered.");
    return;
  }

  try {
    const { data: expoPushToken } = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    await apiClient.post(ENDPOINTS.REGISTER_FCM, { fcmToken: expoPushToken });
    console.log("[FCM] Token registered successfully:", expoPushToken);
  } catch (err) {
    console.error("[FCM] Failed to register token:", err);
  }
}

export function setupNotificationListeners(): () => void {
  let receivedListener: { remove: () => void } | null = null;
  let responseListener: { remove: () => void } | null = null;
  let isActive = true;

  void getNotificationsModule().then((Notifications) => {
    if (!Notifications || !isActive) {
      return;
    }

    receivedListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log(
          "[FCM] Notification received:",
          notification.request.content.title
        );
      }
    );

    responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;
        console.log("[FCM] Notification tapped, data:", data);
      });
  });

  return () => {
    isActive = false;
    receivedListener?.remove();
    responseListener?.remove();
  };
}
