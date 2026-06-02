import React, { useMemo } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Bell, CheckCircle2, Home, MapPin, Router, ShieldAlert } from "lucide-react-native";
import { ScreenHeader } from "@/components/navigation/ScreenHeader";
import { COLORS } from "@/constants/theme";
import {
  useMarkNotificationReadMutation,
  useNotificationsQuery,
} from "@/hooks/useNotificationQueries";
import { useBackNavigation } from "@/hooks/useBackNavigation";
import type { NotificationItem, NotificationType } from "@/types/notification.types";
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

function ActionButton({
  title,
  description,
  Icon,
  onPress,
  disabled,
}: {
  title: string;
  description: string;
  Icon: typeof Bell;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      className="mt-3 flex-row items-center rounded-[22px] border px-5 py-4"
      style={{
        borderColor: COLORS.line,
        backgroundColor: disabled ? COLORS.surfaceMuted : "white",
        opacity: disabled ? 0.62 : 1,
      }}
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
    >
      <View
        className="mr-4 h-11 w-11 items-center justify-center rounded-[16px]"
        style={{ backgroundColor: COLORS.coralSoft }}
      >
        <Icon size={22} color={COLORS.coral} strokeWidth={2.2} />
      </View>
      <View className="flex-1">
        <Text className="text-[16px] font-extrabold" style={{ color: COLORS.text }}>
          {title}
        </Text>
        <Text className="mt-1 text-[13px] font-semibold leading-5" style={{ color: COLORS.muted }}>
          {description}
        </Text>
      </View>
    </Pressable>
  );
}

function findNotification(lists: Array<NotificationItem[] | undefined>, id?: string) {
  if (!id) return undefined;
  return lists.flatMap((list) => list ?? []).find((item) => item.id === id);
}

export default function AlertDetailScreen() {
  const goBack = useBackNavigation("/alerts");
  const params = useLocalSearchParams<{ id?: string; type?: NotificationType }>();
  const alarmQuery = useNotificationsQuery({ type: "alarm" });
  const homeQuery = useNotificationsQuery({ type: "home" });
  const deviceQuery = useNotificationsQuery({ type: "device" });
  const notification = useMemo(
    () => findNotification([alarmQuery.data, homeQuery.data, deviceQuery.data], params.id),
    [alarmQuery.data, deviceQuery.data, homeQuery.data, params.id]
  );
  const markRead = useMarkNotificationReadMutation(notification?.type ?? params.type);
  const loading = alarmQuery.isLoading || homeQuery.isLoading || deviceQuery.isLoading;
  const metadata = notification?.metadata ?? {};
  const eventType = asString(metadata.eventType);
  const severity = asString(metadata.severity);
  const sound = asString(metadata.sound);
  const occurredAt = asString(metadata.occurredAt);
  const confidence = asNumber(metadata.confidence);
  const location = getLocationLabel(metadata.location);
  const isCritical = severity === "critical" || notification?.type === "alarm";

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

          <View className="mt-8">
            <Text className="mb-1 text-[15px] font-extrabold uppercase" style={{ color: COLORS.muted }}>
              Actions
            </Text>
            <ActionButton
              title={notification.readAt ? "Already marked as read" : "Mark as read"}
              description="Acknowledge this alert in the message center."
              Icon={CheckCircle2}
              disabled={!!notification.readAt || markRead.isPending}
              onPress={() => markRead.mutate(notification.id)}
            />
            <ActionButton
              title="View related device"
              description="Open the paired device detail page for this alert."
              Icon={Router}
              disabled={!notification.device?.id}
              onPress={() => router.push(`/device-detail?id=${notification.device?.id}` as never)}
            />
            <ActionButton
              title="Back to alerts"
              description="Return to the notification center."
              Icon={Home}
              onPress={() => router.replace("/alerts" as never)}
            />
            {location ? (
              <View className="mt-5 flex-row items-center rounded-[18px] px-4 py-3" style={{ backgroundColor: COLORS.surfaceMuted }}>
                <MapPin size={18} color={COLORS.muted} strokeWidth={2.1} />
                <Text className="ml-2 flex-1 text-[12px] font-semibold leading-5" style={{ color: COLORS.muted }}>
                  Location is shown as coordinates because no map or emergency service integration is available yet.
                </Text>
              </View>
            ) : null}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
