export type NotificationPreference = {
  id: string;
  deviceAlertEnabled: boolean;
  dndEnabled: boolean;
  dndStartTime: string | null;
  dndEndTime: string | null;
  systemNotificationEnabled: boolean;
  homeAlertEnabled: boolean;
  fallAlertEnabled: boolean;
  sosAlertEnabled: boolean;
  deviceOfflineAlertEnabled: boolean;
  lowBatteryAlertEnabled: boolean;
  pairingRequestAlertEnabled: boolean;
  bulletinEnabled: boolean;
  fcmToken: string | null;
  fcmPlatform: "ios" | "android" | "web" | null;
  updatedAt: string;
};

export type NotificationType = "alarm" | "home" | "device";

export type NotificationItem = {
  id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  metadata: Record<string, unknown> | null;
  readAt: string | null;
  createdAt: string;
  home: { id: string; name: string } | null;
  device: { id: string; deviceId: string; name: string | null } | null;
};

export type ListNotificationsParams = {
  type?: NotificationType;
  limit?: number;
};

export type UpdateNotificationPreferencePayload = Partial<
  Pick<
    NotificationPreference,
    | "deviceAlertEnabled"
    | "dndEnabled"
    | "dndStartTime"
    | "dndEndTime"
    | "systemNotificationEnabled"
    | "homeAlertEnabled"
    | "fallAlertEnabled"
    | "sosAlertEnabled"
    | "deviceOfflineAlertEnabled"
    | "lowBatteryAlertEnabled"
    | "pairingRequestAlertEnabled"
    | "bulletinEnabled"
    | "fcmToken"
    | "fcmPlatform"
  >
>;
