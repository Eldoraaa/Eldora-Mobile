import React, { useMemo } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import {
  Bell,
  ChevronRight,
  LucideIcon,
  Radio,
  Router as RouterIcon,
  Settings2,
  ShieldCheck,
  Wifi,
} from "lucide-react-native";
import { ScreenHeader } from "@/components/navigation/ScreenHeader";
import { COLORS } from "@/constants/theme";
import { useDevicesScreenQuery } from "@/hooks/useDeviceQueries";
import { useBackNavigation } from "@/hooks/useBackNavigation";
import {
  deviceStatusText,
  isWearableDevice,
  signalLabel,
} from "@/utils/device.utils";
import { formatRelativeTime } from "@/utils/formatters";

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-center justify-between py-4">
      <Text
        className="text-[15px] font-semibold"
        style={{ color: COLORS.muted }}
      >
        {label}
      </Text>
      <Text
        className="ml-5 max-w-[56%] text-right text-[15px] font-bold"
        style={{ color: COLORS.text }}
        numberOfLines={2}
      >
        {value}
      </Text>
    </View>
  );
}

function ActionRow({
  title,
  description,
  Icon,
  onPress,
}: {
  title: string;
  description: string;
  Icon: LucideIcon;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      className="flex-row items-center py-5"
      activeOpacity={0.78}
      onPress={onPress}
    >
      <View
        className="mr-4 h-11 w-11 items-center justify-center rounded-[16px]"
        style={{ backgroundColor: COLORS.surfaceMuted }}
      >
        <Icon size={22} color={COLORS.coral} />
      </View>
      <View className="flex-1">
        <Text
          className="text-[16px] font-extrabold"
          style={{ color: COLORS.text }}
        >
          {title}
        </Text>
        <Text
          className="mt-1 text-[13px] font-semibold leading-5"
          style={{ color: COLORS.muted }}
        >
          {description}
        </Text>
      </View>
      <ChevronRight size={22} color={COLORS.disabled} />
    </TouchableOpacity>
  );
}

export default function DeviceDetailScreen() {
  const goBack = useBackNavigation("/home");
  const params = useLocalSearchParams<{ id?: string }>();
  const devicesQuery = useDevicesScreenQuery();
  const device = devicesQuery.data?.devices.find((item) => item.id === params.id);
  const wearable = device ? isWearableDevice(device) : false;
  const title = device ? (wearable ? "AegisWear" : "Eldora Core") : "Device";
  const Icon = wearable ? ShieldCheck : RouterIcon;

  const primaryRows = useMemo(() => {
    if (!device) return [];
    return [
      ["Status", deviceStatusText(device.isOnline)],
      ["Room", device.roomCategory?.name ?? "Home level"],
      ["Elder profile", device.elderName],
      [
        "Last seen",
        device.lastSeen ? formatRelativeTime(device.lastSeen) : "No heartbeat",
      ],
    ];
  }, [device]);

  if (!device) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="mx-auto w-full max-w-[430px] flex-1 bg-white">
          <ScreenHeader title="Device Detail" onBack={goBack} />
          <View className="flex-1 items-center justify-center px-8">
            <RouterIcon size={52} color={COLORS.disabled} strokeWidth={1.8} />
            <Text
              className="mt-5 text-center text-[18px] font-extrabold"
              style={{ color: COLORS.muted }}
            >
              Device not found
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="mx-auto w-full max-w-[430px] flex-1 bg-white">
        <ScreenHeader title="Device Detail" onBack={goBack} />
        <ScrollView
          className="flex-1 bg-white"
          contentContainerClassName="px-6 pb-12 pt-6"
          showsVerticalScrollIndicator={false}
        >
          <View
            className="overflow-hidden rounded-[24px] px-6 py-7"
            style={{ backgroundColor: COLORS.warmPanel }}
          >
            <View className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/40" />
            <View className="flex-row items-center">
              <View className="mr-5 h-16 w-16 items-center justify-center rounded-[22px] bg-white">
                <Icon
                  size={33}
                  color={device.isOnline ? COLORS.coral : COLORS.disabled}
                  strokeWidth={2.1}
                />
              </View>
              <View className="flex-1">
                <Text
                  className="text-[22px] font-extrabold leading-7"
                  style={{ color: COLORS.text }}
                  numberOfLines={1}
                >
                  {title}
                </Text>
                <Text
                  className="mt-1 text-[14px] font-semibold"
                  style={{ color: device.isOnline ? COLORS.success : COLORS.warning }}
                >
                  {deviceStatusText(device.isOnline)}
                </Text>
              </View>
            </View>
          </View>

          <View className="mt-7">
            {primaryRows.map(([label, value]) => (
              <InfoRow key={label} label={label} value={value} />
            ))}
            <InfoRow
              label="Battery"
              value={
                device.batteryLevel === null
                  ? "Unknown"
                  : `${device.batteryLevel}%${device.isCharging ? " charging" : ""}`
              }
            />
            <InfoRow label="Firmware" value={device.firmwareVersion ?? "Unknown"} />
            {!wearable ? (
              <>
                <InfoRow label="Care role" value="Voice companion and Wi-Fi hub" />
                <InfoRow label="Wi-Fi" value={device.wifiSsid ?? "Not configured"} />
                <InfoRow label="Signal" value={signalLabel(device.wifiRssi)} />
                <InfoRow label="Local IP" value={device.localIp ?? "Unavailable"} />
              </>
            ) : (
              <>
                <InfoRow label="Care role" value="Fall alert wearable" />
                <InfoRow label="Fall alerts" value="AegisWear movement event" />
              </>
            )}
          </View>

          <View className="mt-8">
            <Text
              className="mb-2 text-[15px] font-extrabold uppercase"
              style={{ color: COLORS.muted }}
            >
              Actions
            </Text>
            {!wearable ? (
              <>
                <ActionRow
                  title="Configure Wi-Fi"
                  description="Review pairing steps before changing the Core network."
                  Icon={Wifi}
                  onPress={() => router.push("/device-setup?type=core" as never)}
                />
                <ActionRow
                  title="Create Core check-in scene"
                  description="Make a tap-to-run scene that speaks through Eldora Core."
                  Icon={Radio}
                  onPress={() =>
                    router.push("/scene-builder?template=scheduled_check_in" as never)
                  }
                />
              </>
            ) : (
              <>
                <ActionRow
                  title="Review wearable setup"
                  description="Check how AegisWear should be worn before pairing."
                  Icon={Bell}
                  onPress={() => router.push("/device-setup?type=aegiswear" as never)}
                />
                <ActionRow
                  title="Create fall response scene"
                  description="Make an IF fall detected, THEN alert family rule."
                  Icon={ShieldCheck}
                  onPress={() =>
                    router.push("/scene-builder?template=fall_response" as never)
                  }
                />
              </>
            )}
            <ActionRow
              title="Manage device"
              description="Change room, order, visibility, or remove the device."
              Icon={Settings2}
              onPress={() => router.push("/device-management" as never)}
            />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
