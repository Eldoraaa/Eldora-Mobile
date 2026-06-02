import { notificationService } from "@/services/notificationService";

export const notificationApi = {
  getNotifications: notificationService.getNotifications,
  markNotificationRead: notificationService.markNotificationRead,
  markAllNotificationsRead: notificationService.markAllNotificationsRead,
  getPreferences: notificationService.getPreferences,
  updatePreferences: notificationService.updatePreferences,
};
