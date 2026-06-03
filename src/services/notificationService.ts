import { apiClient } from "./api";
import { ENDPOINTS } from "@/constants/api";
import { ApiResponse } from "@/types/api.types";
import {
  ListNotificationsParams,
  NotificationItem,
  NotificationPreference,
  UpdateNotificationPreferencePayload,
} from "@/types/notification.types";

export const notificationService = {
  async getNotifications(
    params: ListNotificationsParams = {}
  ): Promise<NotificationItem[]> {
    const response = await apiClient.get<ApiResponse<NotificationItem[]>>(
      ENDPOINTS.NOTIFICATIONS,
      { params }
    );
    return response.data.data;
  },

  async getNotification(notificationId: string): Promise<NotificationItem> {
    const response = await apiClient.get<ApiResponse<NotificationItem>>(
      `${ENDPOINTS.NOTIFICATIONS}/${notificationId}`
    );
    return response.data.data;
  },

  async markNotificationRead(notificationId: string): Promise<void> {
    await apiClient.patch(`${ENDPOINTS.NOTIFICATIONS}/${notificationId}/read`);
  },

  async respondNotification(
    notificationId: string,
    payload: { status: "acknowledged" | "calling" | "en_route" | "resolved"; note?: string }
  ): Promise<void> {
    await apiClient.patch(`${ENDPOINTS.NOTIFICATIONS}/${notificationId}/respond`, payload);
  },

  async resolveNotification(notificationId: string): Promise<void> {
    await apiClient.patch(`${ENDPOINTS.NOTIFICATIONS}/${notificationId}/resolve`);
  },

  async markAllNotificationsRead(): Promise<void> {
    await apiClient.patch(`${ENDPOINTS.NOTIFICATIONS}/read-all`);
  },

  async getPreferences(): Promise<NotificationPreference> {
    const response = await apiClient.get<ApiResponse<NotificationPreference>>(
      ENDPOINTS.NOTIFICATION_PREFERENCES
    );
    return response.data.data;
  },

  async updatePreferences(
    payload: UpdateNotificationPreferencePayload
  ): Promise<NotificationPreference> {
    const response = await apiClient.patch<ApiResponse<NotificationPreference>>(
      ENDPOINTS.NOTIFICATION_PREFERENCES,
      payload
    );
    return response.data.data;
  },
};
