import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationApi } from "@/api/notificationApi";
import { queryKeys } from "@/lib/queryClient";
import {
  ListNotificationsParams,
  NotificationItem,
  NotificationPreference,
  UpdateNotificationPreferencePayload,
} from "@/types/notification.types";

export function useNotificationQuery(notificationId?: string | null) {
  return useQuery({
    queryKey: queryKeys.notifications.detail(notificationId),
    queryFn: () => notificationApi.getNotification(notificationId!),
    enabled: Boolean(notificationId),
  });
}

export function useNotificationsQuery(params: ListNotificationsParams = {}) {
  return useQuery({
    queryKey: queryKeys.notifications.list(params.type, params.homeId),
    queryFn: () => notificationApi.getNotifications(params),
    enabled: Boolean(params.homeId),
  });
}

export function useMarkNotificationReadMutation(type?: string, homeId?: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      notificationApi.markNotificationRead(notificationId),
    onMutate: async (notificationId) => {
      const key = queryKeys.notifications.list(type, homeId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<NotificationItem[]>(key);

      if (previous) {
        queryClient.setQueryData<NotificationItem[]>(
          key,
          previous.map((item) =>
            item.id === notificationId
              ? { ...item, readAt: new Date().toISOString() }
              : item
          )
        );
      }

      return { previous, key };
    },
    onError: (_error, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(context.key, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.list(type, homeId),
      });
    },
  });
}

export function useRespondNotificationMutation(type?: string, homeId?: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      notificationId,
      status,
      note,
    }: {
      notificationId: string;
      status: "acknowledged" | "calling" | "en_route" | "resolved";
      note?: string;
    }) => notificationApi.respondNotification(notificationId, { status, note }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.list(type, homeId),
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.home.safetySummary });
    },
  });
}

export function useResolveNotificationMutation(type?: string, homeId?: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      notificationApi.resolveNotification(notificationId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.list(type, homeId),
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.home.safetySummary });
    },
  });
}

export function useNotificationPreferencesQuery() {
  return useQuery({
    queryKey: queryKeys.notifications.preferences,
    queryFn: notificationApi.getPreferences,
  });
}

export function useUpdateNotificationPreferencesMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateNotificationPreferencePayload) =>
      notificationApi.updatePreferences(payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.notifications.preferences,
      });
      const previous = queryClient.getQueryData<NotificationPreference>(
        queryKeys.notifications.preferences
      );

      if (previous) {
        queryClient.setQueryData<NotificationPreference>(
          queryKeys.notifications.preferences,
          { ...previous, ...payload }
        );
      }

      return { previous };
    },
    onError: (_error, _payload, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          queryKeys.notifications.preferences,
          context.previous
        );
      }
    },
    onSuccess: (updatedPreferences) => {
      queryClient.setQueryData(
        queryKeys.notifications.preferences,
        updatedPreferences
      );
    },
  });
}
