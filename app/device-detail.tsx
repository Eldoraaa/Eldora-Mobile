import React, { useMemo } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import {
  Activity,
  Battery,
  Bell,
  ChevronRight,
  HeartPulse,
  LucideIcon,
  Radio,
  Router as RouterIcon,
  Settings2,
  ShieldAlert,
  ShieldCheck,
  Signal,
  Volume2,
  Wifi,
} from "lucide-react-native";
import { ScreenHeader } from "@/components/navigation/ScreenHeader";
import { COLORS } from "@/constants/theme";
import { useDevicesScreenQuery } from "@/hooks/useDeviceQueries";
import { useBackNavigation } from "@/hooks/useBackNavigation";
import { useHomesQuery, useSafetySummaryQuery, useWellnessSummaryQuery } from "@/hooks/useHomeManagementQueries";
import {
  batteryColor,
  deviceStatusText,
  isDoraShieldDevice,
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

function InsightMetric({
  label,
  value,
  helper,
  progress,
  color,
  Icon,
}: {
  label: string;
  value: string;
  helper: string;
  progress: number;
  color: string;
  Icon: LucideIcon;
}) {
  const safeProgress = Math.max(0, Math.min(100, progress));

  return (
    <View className="mb-3 w-[48%] rounded-[22px] border bg-white p-4" style={{ borderColor: COLORS.line }}>
      <View className="flex-row items-center justify-between">
        <View className="h-10 w-10 items-center justify-center rounded-[15px]" style={{ backgroundColor: COLORS.surfaceMuted }}>
          <Icon size={20} color={color} />
        </View>
        <Text className="text-[18px] font-extrabold" style={{ color }}>
          {value}
        </Text>
      </View>
      <Text className="mt-4 text-[13px] font-extrabold" style={{ color: COLORS.text }}>
        {label}
      </Text>
      <Text className="mt-1 text-[11px] font-semibold" style={{ color: COLORS.muted }} numberOfLines={1}>
        {helper}
      </Text>
      <View className="mt-3 h-2 overflow-hidden rounded-full" style={{ backgroundColor: COLORS.surfaceMuted }}>
        <View className="h-full rounded-full" style={{ width: `${safeProgress}%`, backgroundColor: color }} />
      </View>
    </View>
  );
}

function MiniTrend({ values, color }: { values: number[]; color: string }) {
  return (
    <View className="mt-5 h-[76px] flex-row items-end gap-2 rounded-[20px] px-3 pb-3 pt-4" style={{ backgroundColor: COLORS.surfaceMuted }}>
      {values.map((value, index) => (
        <View key={`${value}-${index}`} className="flex-1 rounded-t-xl" style={{ height: `${Math.max(12, Math.min(100, value))}%`, backgroundColor: color }} />
      ))}
    </View>
  );
}

export default function DeviceDetailScreen() {
  const goBack = useBackNavigation("/home");
  const params = useLocalSearchParams<{ id?: string }>();
  const devicesQuery = useDevicesScreenQuery();
  const homesQuery = useHomesQuery();
  const selectedHome = homesQuery.data?.[0];
  const safetySummaryQuery = useSafetySummaryQuery(selectedHome?.id);
  const wellnessSummaryQuery = useWellnessSummaryQuery(selectedHome?.id);
  const device = devicesQuery.data?.devices.find((item) => item.id === params.id);
  const shield = device ? isDoraShieldDevice(device) : false;
  const title = device ? (shield ? "DoraShield" : "DoraBot") : "Device";
  const Icon = shield ? ShieldCheck : RouterIcon;

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
  const riskSummary = safetySummaryQuery.data?.risk;
  const wellnessSummary = wellnessSummaryQuery.data;
  const batteryLevel = device?.batteryLevel ?? null;
  const signalScore = device?.wifiRssi === null || device?.wifiRssi === undefined
    ? 0
    : Math.max(0, Math.min(100, Math.round(((device.wifiRssi + 95) / 55) * 100)));
  const heartbeatScore = device?.isOnline ? 92 : device?.lastSeen ? 45 : 12;
  const riskScore = riskSummary?.score ?? (device?.isOnline ? 18 : 72);
  const riskLevel = riskSummary?.level ?? (device?.isOnline ? "low" : "high");
  const riskAccent = riskLevel === "high" ? COLORS.coral : riskLevel === "medium" ? COLORS.warning : COLORS.success;
  const wellnessAccent = wellnessSummary?.distressLevel === "high" ? COLORS.coral : wellnessSummary?.distressLevel === "medium" ? COLORS.warning : COLORS.success;
  const anomalyLabels: Record<string, string> = {
    open_alert: "Open alert",
    unresolved_critical: "Critical unresolved",
    no_response_alert: "No response",
    frequent_alerts: "Frequent alerts",
    device_offline: "Device offline",
    no_heartbeat: "No heartbeat",
    low_battery: "Low battery",
  };
  const anomalyFlags = riskSummary?.anomalyFlags ?? (!device?.isOnline ? ["device_offline", "no_heartbeat"] : []);
  const trendValues = [
    Math.max(12, 100 - riskScore),
    heartbeatScore,
    batteryLevel ?? 68,
    signalScore || 58,
    wellnessSummary ? Math.max(12, 100 - wellnessSummary.distressScore) : 78,
  ];

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

          <View className="mt-6 rounded-[24px] border bg-white p-5" style={{ borderColor: COLORS.line }}>
            <View className="flex-row items-start justify-between">
              <View className="flex-1 pr-4">
                <Text className="text-[13px] font-extrabold uppercase" style={{ color: COLORS.muted }}>
                  Device insight
                </Text>
                <Text className="mt-1 text-[24px] font-extrabold leading-8" style={{ color: COLORS.text }}>
                  {riskLevel.toUpperCase()} risk
                </Text>
                <Text className="mt-2 text-[13px] font-semibold leading-5" style={{ color: COLORS.muted }}>
                  {riskSummary?.recommendation ?? (device.isOnline ? "Device is stable based on current signal and heartbeat." : "Device needs attention because heartbeat is missing.")}
                </Text>
              </View>
              <View className="h-[62px] w-[62px] items-center justify-center rounded-[20px]" style={{ backgroundColor: COLORS.surfaceMuted }}>
                <Text className="text-[20px] font-extrabold" style={{ color: riskAccent }}>
                  {riskScore}
                </Text>
                <Text className="text-[10px] font-bold uppercase" style={{ color: COLORS.muted }}>
                  score
                </Text>
              </View>
            </View>
            <MiniTrend values={trendValues} color={riskAccent} />
            <View className="mt-4 flex-row flex-wrap gap-2">
              {anomalyFlags.length > 0 ? (
                anomalyFlags.map((flag) => (
                  <View key={flag} className="flex-row items-center rounded-full px-3 py-2" style={{ backgroundColor: COLORS.surfaceMuted }}>
                    <ShieldAlert size={13} color={riskAccent} />
                    <Text className="ml-1.5 text-[12px] font-extrabold" style={{ color: COLORS.text }}>
                      {anomalyLabels[flag] ?? flag.replace(/_/g, " ")}
                    </Text>
                  </View>
                ))
              ) : (
                <View className="flex-row items-center rounded-full px-3 py-2" style={{ backgroundColor: COLORS.surfaceMuted }}>
                  <ShieldCheck size={13} color={COLORS.success} />
                  <Text className="ml-1.5 text-[12px] font-extrabold" style={{ color: COLORS.success }}>
                    Stable, no anomaly
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View className="mt-5 flex-row flex-wrap justify-between">
            <InsightMetric
              label="Battery"
              value={batteryLevel === null ? "--" : `${batteryLevel}%`}
              helper={device.isCharging ? "Charging" : "Current level"}
              progress={batteryLevel ?? 0}
              color={batteryColor(batteryLevel)}
              Icon={Battery}
            />
            <InsightMetric
              label="Signal"
              value={!shield ? signalLabel(device.wifiRssi) : "DoraShield"}
              helper={!shield && device.wifiRssi !== null ? `${device.wifiRssi} dBm` : "No Wi-Fi metric"}
              progress={!shield ? signalScore : 70}
              color={signalScore >= 65 || shield ? COLORS.success : signalScore >= 40 ? COLORS.warning : COLORS.coral}
              Icon={Signal}
            />
            <InsightMetric
              label="Heartbeat"
              value={device.isOnline ? "Live" : "Lost"}
              helper={device.lastSeen ? formatRelativeTime(device.lastSeen) : "No heartbeat"}
              progress={heartbeatScore}
              color={device.isOnline ? COLORS.success : COLORS.warning}
              Icon={HeartPulse}
            />
            <InsightMetric
              label="Wellness"
              value={wellnessSummary?.moodTrend.replace(/_/g, " ") ?? "Stable"}
              helper={wellnessSummary ? `Distress ${wellnessSummary.distressScore}` : "Home signal"}
              progress={wellnessSummary ? Math.max(0, 100 - wellnessSummary.distressScore) : 78}
              color={wellnessAccent}
              Icon={Activity}
            />
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
            {!shield ? (
              <>
                <InfoRow label="Care role" value="Voice companion and Wi-Fi hub" />
                <InfoRow label="Wi-Fi" value={device.wifiSsid ?? "Not configured"} />
                <InfoRow label="Signal" value={signalLabel(device.wifiRssi)} />
                <InfoRow label="Local IP" value={device.localIp ?? "Unavailable"} />
              </>
            ) : (
              <>
                <InfoRow label="Care role" value="Fall alert shield" />
                <InfoRow label="Fall alerts" value="DoraShield movement event" />
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
            {!shield ? (
              <>
                <ActionRow
                  title="Voice Settings"
                  description="Change voice character, speed, and language for this DoraBot."
                  Icon={Volume2}
                  onPress={() => router.push(`/voice-settings?deviceId=${device.id}` as never)}
                />
                <ActionRow
                  title="Configure Wi-Fi"
                  description="Review pairing steps before changing the DoraBot network."
                  Icon={Wifi}
                  onPress={() => router.push("/device-setup?type=dorabot" as never)}
                />
                <ActionRow
                  title="Create DoraBot check-in scene"
                  description="Make a tap-to-run scene that speaks through DoraBot."
                  Icon={Radio}
                  onPress={() =>
                    router.push("/scene-builder?template=scheduled_check_in" as never)
                  }
                />
              </>
            ) : (
              <>
                <ActionRow
                  title="Review shield setup"
                  description="Check how DoraShield should be worn before pairing."
                  Icon={Bell}
                  onPress={() => router.push("/device-setup?type=dorashield" as never)}
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
