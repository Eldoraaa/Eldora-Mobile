import { notificationService } from "@/services/notificationService";

export const notificationApi = {
  getNotification: notificationService.getNotification,
  getNotifications: notificationService.getNotifications,
  markNotificationRead: notificationService.markNotificationRead,
  respondNotification: notificationService.respondNotification,
  resolveNotification: notificationService.resolveNotification,
  markAllNotificationsRead: notificationService.markAllNotificationsRead,
  getPreferences: notificationService.getPreferences,
  updatePreferences: notificationService.updatePreferences,
};
