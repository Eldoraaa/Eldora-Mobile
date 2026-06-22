import React, { useEffect, useRef } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { Bell, MapPin, ShieldAlert } from "lucide-react-native";
import { ScreenHeader } from "@/components/navigation/ScreenHeader";
import { COLORS } from "@/constants/theme";
import {
  useMarkNotificationReadMutation,
  useNotificationQuery,
} from "@/hooks/useNotificationQueries";
import { useBackNavigation } from "@/hooks/useBackNavigation";
import { useHomeStore } from "@/stores/homeStore";
import type { NotificationType } from "@/types/notification.types";
import { formatRelativeTime } from "@/utils/formatters";

function asString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function asNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatMetadataLabel(value: string) {
  return value
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getLocationLabel(value: unknown) {
  if (!value || typeof value !== "object") return null;
  const location = value as Record<string, unknown>;
  const lat = asNumber(location.lat) ?? asNumber(location.latitude);
  const lon = asNumber(location.lon) ?? asNumber(location.lng) ?? asNumber(location.longitude);
  if (lat === null || lon === null) return null;
  return `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="border-b py-4" style={{ borderColor: COLORS.line }}>
      <Text className="text-[13px] font-extrabold uppercase" style={{ color: COLORS.disabled }}>
        {label}
      </Text>
      <Text className="mt-2 text-[16px] font-bold leading-6" style={{ color: COLORS.text }}>
        {value}
      </Text>
    </View>
  );
}

export default function AlertDetailScreen() {
  const goBack = useBackNavigation("/alerts");
  const params = useLocalSearchParams<{ id?: string; type?: NotificationType }>();
  const notificationQuery = useNotificationQuery(params.id);
  const notification = notificationQuery.data;
  const notificationType = notification?.type ?? params.type;
  const notificationHomeId = notification?.home?.id ?? null;
  const setSelectedHomeId = useHomeStore((state) => state.setSelectedHomeId);
  const markRead = useMarkNotificationReadMutation(notificationType, notificationHomeId);
  const autoReadNotificationId = useRef<string | null>(null);
  const loading = notificationQuery.isLoading;
  const metadata = notification?.metadata ?? {};
  const eventType = asString(metadata.eventType);
  const severity = asString(metadata.severity);
  const sound = asString(metadata.sound);
  const resolvedAt = asString(metadata.resolvedAt);
  const occurredAt = asString(metadata.occurredAt);
  const confidence = asNumber(metadata.confidence);
  const location = getLocationLabel(metadata.location);
  const isCritical = severity === "critical" || notification?.type === "alarm";

  useEffect(() => {
    if (notificationHomeId) setSelectedHomeId(notificationHomeId);
  }, [notificationHomeId, setSelectedHomeId]);

  useEffect(() => {
    if (!notification || notification.readAt || markRead.isPending) return;
    if (autoReadNotificationId.current === notification.id) return;
    autoReadNotificationId.current = notification.id;
    markRead.mutate(notification.id);
  }, [markRead, notification]);

  if (loading && !notification) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="mx-auto w-full max-w-[430px] flex-1 bg-white">
          <ScreenHeader title="Alert Detail" onBack={goBack} />
          <View className="flex-1 items-center justify-center pb-20">
            <ActivityIndicator color={COLORS.coral} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!notification) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="mx-auto w-full max-w-[430px] flex-1 bg-white">
          <ScreenHeader title="Alert Detail" onBack={goBack} />
          <View className="flex-1 items-center justify-center px-8 pb-20">
            <Bell size={54} color={COLORS.disabled} strokeWidth={1.8} />
            <Text className="mt-5 text-center text-[18px] font-extrabold" style={{ color: COLORS.muted }}>
              Alert not found
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="mx-auto w-full max-w-[430px] flex-1 bg-white">
        <ScreenHeader title="Alert Detail" onBack={goBack} />
        <ScrollView className="flex-1" contentContainerClassName="px-6 pb-12 pt-6" showsVerticalScrollIndicator={false}>
          <View
            className="overflow-hidden rounded-[26px] px-6 py-7"
            style={{ backgroundColor: isCritical ? COLORS.coralSoft : COLORS.warmPanel }}
          >
            <View className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/40" />
            <View className="flex-row items-start">
              <View className="mr-5 h-16 w-16 items-center justify-center rounded-[22px] bg-white">
                <ShieldAlert size={34} color={isCritical ? COLORS.coral : COLORS.warning} strokeWidth={2.15} />
              </View>
              <View className="flex-1">
                <Text className="text-[13px] font-extrabold uppercase" style={{ color: COLORS.muted }}>
                  {notification.readAt ? "Read alert" : "New alert"}
                </Text>
                <Text className="mt-2 text-[24px] font-extrabold leading-8" style={{ color: COLORS.text }}>
                  {notification.title}
                </Text>
                {notification.body ? (
                  <Text className="mt-2 text-[14px] font-semibold leading-6" style={{ color: COLORS.muted }}>
                    {notification.body}
                  </Text>
                ) : null}
              </View>
            </View>
          </View>

          <View className="mt-7 rounded-[24px] bg-white px-1">
            <DetailRow label="Received" value={`${formatDateTime(notification.createdAt)} · ${formatRelativeTime(notification.createdAt)}`} />
            {occurredAt ? <DetailRow label="Event time" value={formatDateTime(occurredAt)} /> : null}
            {resolvedAt ? <DetailRow label="Resolved" value={formatDateTime(resolvedAt)} /> : null}
            <DetailRow label="Type" value={formatMetadataLabel(eventType ?? notification.type)} />
            {severity ? <DetailRow label="Severity" value={formatMetadataLabel(severity)} /> : null}
            {confidence !== null ? <DetailRow label="Confidence" value={`${Math.round(confidence * 100)}%`} /> : null}
            {location ? <DetailRow label="Location" value={location} /> : null}
            {notification.device ? (
              <DetailRow
                label="Device"
                value={notification.device.name ?? notification.device.deviceId}
              />
            ) : null}
            {notification.home ? <DetailRow label="Home" value={notification.home.name} /> : null}
            {sound ? <DetailRow label="Alert sound" value={formatMetadataLabel(sound)} /> : null}
          </View>

          {location ? (
            <View className="mt-7 flex-row items-center rounded-[18px] px-4 py-3" style={{ backgroundColor: COLORS.surfaceMuted }}>
              <MapPin size={18} color={COLORS.muted} strokeWidth={2.1} />
              <Text className="ml-2 flex-1 text-[12px] font-semibold leading-5" style={{ color: COLORS.muted }}>
                Location is shown as coordinates because no map or emergency service integration is available yet.
              </Text>
            </View>
          ) : null}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
