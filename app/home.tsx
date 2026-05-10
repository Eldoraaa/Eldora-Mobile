import React, { useMemo } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import {
  BatteryCharging,
  BatteryMedium,
  Plus,
  Router as RouterIcon,
  Settings,
  ShieldCheck,
  Wifi,
  WifiOff,
} from "lucide-react-native";
import { useAuthStore } from "@/stores/authStore";
import { homeService } from "@/services/homeService";
import { DeviceStatus } from "@/types/home.types";
import { formatRelativeTime } from "@/utils/formatters";
import { MainTabScreen } from "@/components/navigation/MainTabScreen";
import { queryKeys } from "@/lib/queryClient";

function batteryCopy(device?: DeviceStatus) {
  if (device?.batteryLevel === null || device?.batteryLevel === undefined) {
    return "--%";
  }
  return `${device.batteryLevel}%`;
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <View className="flex-1 rounded-[20px] bg-[#F8FBFD] p-4">
      <View className="mb-4 h-10 w-10 items-center justify-center rounded-2xl bg-white">
        {icon}
      </View>
      <Text className="text-[24px] font-bold text-[#1F2A37]">{value}</Text>
      <Text className="mt-1 text-[12px] font-semibold text-[#7B8794]">
        {label}
      </Text>
    </View>
  );
}

export default function HomeScreen() {
  const { user } = useAuthStore();
  const {
    data: summary,
    isPending,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: queryKeys.home.summary,
    queryFn: homeService.getSummary,
  });

  const devices = summary?.devices ?? [];
  const mainDevice = devices[0];
  const onlineDevices = useMemo(
    () => devices.filter((device) => device.isOnline).length,
    [devices]
  );
  const isInitialLoading = isPending && !summary;

  return (
    <MainTabScreen active="home">
      <View className="flex-1 px-4 pt-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-[24px] font-bold text-[#1F2A37]">
            Hi, {user?.name?.split(" ")[0] ?? "Caregiver"}
          </Text>

          <TouchableOpacity
            onPress={() => router.replace("/settings" as never)}
            className="h-10 w-10 items-center justify-center rounded-full bg-[#F8FBFD]"
            activeOpacity={0.85}
            accessibilityLabel="Settings"
          >
            <Settings size={18} color="#7B8794" />
          </TouchableOpacity>
        </View>

        <ScrollView
          className="mt-5 flex-1"
          contentContainerClassName="pb-5"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => {
                void refetch();
              }}
              tintColor="#FF8A7A"
            />
          }
        >
          <View className="overflow-hidden rounded-[26px] bg-[#EAF5FB]">
            <View className="items-center px-5 pb-8 pt-8">
              <View className="h-[132px] w-[132px] items-center justify-center rounded-full border border-white/80">
                <View className="h-[98px] w-[98px] items-center justify-center rounded-full bg-white">
                  <View className="h-[70px] w-[70px] items-center justify-center rounded-full bg-[#101827]">
                    {isInitialLoading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : mainDevice?.isOnline ? (
                      <Wifi size={30} color="#A8D8C2" />
                    ) : (
                      <WifiOff size={30} color="#FFFFFF" />
                    )}
                  </View>
                </View>
              </View>

              <Text className="mt-6 text-center text-[22px] font-bold text-[#1F2A37]">
                {mainDevice?.name ?? "No hub connected"}
              </Text>
              <Text className="mt-2 text-center text-[13px] leading-5 text-[#6C7A89]">
                {mainDevice
                  ? mainDevice.lastSeen
                    ? `Last seen ${formatRelativeTime(mainDevice.lastSeen)}`
                    : "Waiting for first heartbeat"
                  : "Pair your first hub to start monitoring connection and battery status."}
              </Text>
            </View>

            <View className="rounded-t-[26px] bg-white px-5 py-5">
              <TouchableOpacity
                onPress={() => router.replace("/devices" as never)}
                className="h-14 flex-row items-center justify-center gap-2 rounded-2xl bg-[#2477F2]"
                activeOpacity={0.9}
              >
                <Plus size={20} color="#FFFFFF" />
                <Text className="text-[15px] font-bold text-white">
                  Pair or manage hub
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="mt-4 flex-row gap-3">
            <StatCard
              label="Online"
              value={onlineDevices}
              icon={<ShieldCheck size={20} color="#7BA7D4" />}
            />
            <StatCard
              label="Battery"
              value={batteryCopy(mainDevice)}
              icon={
                mainDevice?.isCharging ? (
                  <BatteryCharging size={20} color="#FF8A7A" />
                ) : (
                  <BatteryMedium size={20} color="#FF8A7A" />
                )
              }
            />
          </View>

          <View className="mt-4 rounded-[22px] bg-[#F8FBFD] p-4">
            <View className="flex-row items-center gap-3">
              <View className="h-11 w-11 items-center justify-center rounded-2xl bg-white">
                <RouterIcon size={21} color="#7BA7D4" />
              </View>
              <View className="flex-1">
                <Text className="text-[15px] font-bold text-[#1F2A37]">
                  {devices.length} hub{devices.length === 1 ? "" : "s"} paired
                </Text>
                <Text className="mt-1 text-[12px] text-[#7B8794]">
                  One hub can be shared with multiple caregiver phones.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

      </View>
    </MainTabScreen>
  );
}
