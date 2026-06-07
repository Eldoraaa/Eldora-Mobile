import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import {
  Bell,
  Home,
  Router,
  Settings,
} from "lucide-react-native";
import { MainTabScreen } from "@/components/navigation/MainTabScreen";
import { COLORS } from "@/constants/theme";
import {
  useMarkNotificationReadMutation,
  useNotificationsQuery,
} from "@/hooks/useNotificationQueries";
import type {
  NotificationItem,
  NotificationType,
} from "@/types/notification.types";

const FILTERS: Array<{
  type: NotificationType;
  label: string;
  icon: typeof Bell;
}> = [
  { type: "alarm", label: "Alarm", icon: Bell },
  { type: "home", label: "Home", icon: Home },
  { type: "device", label: "Device", icon: Router },
];

function formatNotificationTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function NotificationTab({
  active,
  icon: Icon,
  label,
  onPress,
}: {
  active: boolean;
  icon: typeof Bell;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      className="h-11 w-14 items-center justify-center"
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
    >
      <Icon
        size={24}
        color={active ? COLORS.coral : COLORS.disabled}
        strokeWidth={active ? 2.7 : 2.3}
      />
      <View
        className="mt-1 h-1 w-1 rounded-full"
        style={{ backgroundColor: active ? COLORS.coral : "transparent" }}
      />
    </Pressable>
  );
}

function NotificationRow({
  item,
  onPress,
}: {
  item: NotificationItem;
  onPress: () => void;
}) {
  const unread = !item.readAt;
  const Icon = item.type === "alarm" ? Bell : item.type === "home" ? Home : Router;

  return (
    <Pressable
      className="min-h-[82px] flex-row items-start gap-4 border-b px-8 py-4"
      style={{ borderColor: COLORS.line }}
      accessibilityRole="button"
      onPress={onPress}
    >
      <Icon
        size={24}
        color={unread ? COLORS.coral : COLORS.disabled}
        strokeWidth={2.3}
      />
      <View className="flex-1">
        <View className="flex-row items-start gap-2">
          <Text
            className="flex-1 text-[17px] font-extrabold leading-6"
            style={{ color: COLORS.text }}
            numberOfLines={2}
          >
            {item.title}
          </Text>
          {unread ? (
            <View
              className="mt-2 h-2 w-2 rounded-full"
              style={{ backgroundColor: COLORS.coral }}
            />
          ) : null}
        </View>
        {item.body ? (
          <Text
            className="mt-1 text-[14px] leading-5"
            style={{ color: COLORS.muted }}
            numberOfLines={2}
          >
            {item.body}
          </Text>
        ) : null}
        <Text
          className="mt-2 text-[13px] font-semibold leading-4"
          style={{ color: COLORS.disabled }}
        >
          {formatNotificationTime(item.createdAt)}
        </Text>
      </View>
    </Pressable>
  );
}

function EmptyMessages() {
  return (
    <View className="flex-1 items-center justify-center px-8 pb-20">
      <Bell size={58} color="#9AA3AF" strokeWidth={1.9} />
      <Text
        className="mt-5 text-center text-[18px] font-extrabold leading-6"
        style={{ color: COLORS.muted }}
      >
        No messages
      </Text>
      <Text
        className="mt-2 text-center text-[14px] font-semibold leading-5"
        style={{ color: COLORS.muted }}
      >
        New alarms and home updates will appear here.
      </Text>
    </View>
  );
}

export default function MessageCenterScreen() {
  const [selectedType, setSelectedType] = useState<NotificationType>("alarm");
  const { data, isLoading, isRefetching, refetch } = useNotificationsQuery({
    type: selectedType,
  });
  const markRead = useMarkNotificationReadMutation(selectedType);
  const activeFilter = useMemo(
    () => FILTERS.find((filter) => filter.type === selectedType) ?? FILTERS[0],
    [selectedType]
  );
  const notifications = data ?? [];

  return (
    <MainTabScreen active="alerts">
      <View className="flex-1 bg-white">
        <View className="h-[68px] flex-row items-center border-b border-[#F1F1F1] px-5">
          <View className="h-11 w-11" />

          <View className="flex-1 flex-row items-center justify-center gap-2">
            {FILTERS.map((filter) => (
              <NotificationTab
                key={filter.type}
                active={filter.type === selectedType}
                icon={filter.icon}
                label={filter.label}
                onPress={() => setSelectedType(filter.type)}
              />
            ))}
          </View>

          <Pressable
            className="h-11 w-11 items-center justify-center"
            accessibilityRole="button"
            accessibilityLabel="Notification settings"
            onPress={() => router.push("/notification-settings" as never)}
          >
            <Settings size={27} color={COLORS.text} strokeWidth={2.35} />
          </Pressable>
        </View>

        <Text
          className="px-8 pt-8 text-[28px] font-extrabold leading-9"
          style={{ color: COLORS.text }}
        >
          {activeFilter.label}
        </Text>

        {isLoading ? (
          <View className="flex-1 items-center justify-center pb-20">
            <ActivityIndicator color={COLORS.coral} />
          </View>
        ) : notifications.length === 0 ? (
          <ScrollView
            className="flex-1"
            contentContainerClassName="flex-grow"
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                tintColor={COLORS.coral}
                colors={[COLORS.coral]}
                onRefresh={refetch}
              />
            }
          >
            <EmptyMessages />
          </ScrollView>
        ) : (
          <ScrollView
            className="mt-4 flex-1"
            contentContainerClassName="pb-10"
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                tintColor={COLORS.coral}
                colors={[COLORS.coral]}
                onRefresh={refetch}
              />
            }
            showsVerticalScrollIndicator={false}
          >
            {notifications.map((item) => (
              <NotificationRow
                key={item.id}
                item={item}
                onPress={() => {
                  if (!item.readAt) markRead.mutate(item.id);
                  router.push(`/alert-detail?id=${item.id}&type=${item.type}` as never);
                }}
              />
            ))}
          </ScrollView>
        )}
      </View>
    </MainTabScreen>
  );
}
