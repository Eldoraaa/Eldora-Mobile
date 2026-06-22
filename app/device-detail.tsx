import React, { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import {
  Activity,
  Battery,
  Bell,
  CalendarDays,
  ChevronRight,
  HeartPulse,
  LucideIcon,
  Router as RouterIcon,
  ShieldAlert,
  ShieldCheck,
  Signal,
  Volume2,
  Wifi,
} from "lucide-react-native";
import { ScreenHeader } from "@/components/navigation/ScreenHeader";
import { COLORS } from "@/constants/theme";
import { useElderAnalyticsQuery } from "@/hooks/useAnalyticsQuery";
import { useDevicesScreenQuery } from "@/hooks/useDeviceQueries";
import { useBackNavigation } from "@/hooks/useBackNavigation";
import { useSelectedHome } from "@/hooks/useSelectedHome";
import { useSafetySummaryQuery, useWellnessSummaryQuery } from "@/hooks/useHomeManagementQueries";
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

const RANGE_OPTIONS = [
  { value: "7d", label: "7D", days: 7 },
  { value: "14d", label: "14D", days: 14 },
  { value: "30d", label: "30D", days: 30 },
  { value: "custom", label: "", days: null },
] as const;

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["S", "M", "T", "W", "T", "F", "S"];

type RangeValue = (typeof RANGE_OPTIONS)[number]["value"];

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dateFromDaysAgo(days: number) {
  return toDateInputValue(new Date(Date.now() - days * 24 * 60 * 60 * 1000));
}

function dateInputToDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function isSameDate(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function shortDate(value: string) {
  return new Date(value).toLocaleDateString("en", { month: "short", day: "numeric" });
}

function formatMs(ms: number | null) {
  if (ms === null) return "—";
  if (ms < 60_000) return `${Math.round(ms / 1000)}s`;
  return `${Math.round(ms / 60_000)}m`;
}

function readableLabel(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, " ");
}

const EMOTION_LABELS: Record<string, string> = {
  distressed: "Distressed",
  anxious: "Anxious",
  sad: "Sad",
  positive: "Positive",
  neutral: "Neutral",
};

const EMOTION_COLORS: Record<string, string> = {
  distressed: COLORS.coral,
  anxious: COLORS.warning,
  sad: "#6B9DD4",
  happy: COLORS.success,
  calm: "#3B82F6",
  positive: COLORS.success,
  neutral: COLORS.muted,
};

function EmotionBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <View className="mb-3">
      <View className="mb-1.5 flex-row items-center justify-between">
        <Text className="text-[13px] font-extrabold" style={{ color: COLORS.text }}>{label}</Text>
        <Text className="text-[13px] font-bold" style={{ color: COLORS.muted }}>{count} ({pct}%)</Text>
      </View>
      <View className="h-2 overflow-hidden rounded-full" style={{ backgroundColor: COLORS.surfaceMuted }}>
        <View className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </View>
    </View>
  );
}

function CalendarPicker({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const selectedDate = dateInputToDate(value);
  const [month, setMonth] = useState(selectedDate.getMonth());
  const [year, setYear] = useState(selectedDate.getFullYear());
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const today = new Date();
  const days: React.ReactNode[] = [];

  for (let index = 0; index < firstDay; index += 1) {
    days.push(<View key={`empty-${index}`} className="h-10 w-[14.28%]" />);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    const selected = isSameDate(date, selectedDate);
    const current = isSameDate(date, today);
    days.push(
      <TouchableOpacity key={day} className="h-10 w-[14.28%] items-center justify-center" activeOpacity={0.76} onPress={() => onChange(toDateInputValue(date))}>
        <View className="h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: selected ? COLORS.coral : current ? COLORS.coralSoft : "transparent" }}>
          <Text className="text-[14px] font-extrabold" style={{ color: selected ? "#fff" : current ? COLORS.coral : COLORS.text }}>
            {day}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear((current) => current - 1);
      return;
    }
    setMonth((current) => current - 1);
  };

  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear((current) => current + 1);
      return;
    }
    setMonth((current) => current + 1);
  };

  return (
    <View className="rounded-[22px] p-4" style={{ backgroundColor: COLORS.surfaceMuted }}>
      <View className="mb-4 flex-row items-center justify-between">
        <Pressable className="h-10 w-10 items-center justify-center rounded-full bg-white" onPress={prevMonth}>
          <ChevronRight size={20} color={COLORS.text} style={{ transform: [{ rotate: "180deg" }] }} />
        </Pressable>
        <Text className="text-[17px] font-extrabold" style={{ color: COLORS.text }}>
          {MONTHS[month]} {year}
        </Text>
        <Pressable className="h-10 w-10 items-center justify-center rounded-full bg-white" onPress={nextMonth}>
          <ChevronRight size={20} color={COLORS.text} />
        </Pressable>
      </View>
      <View className="mb-2 flex-row">
        {DAYS.map((day, index) => (
          <View key={`${day}-${index}`} className="w-[14.28%] items-center">
            <Text className="text-[11px] font-extrabold" style={{ color: COLORS.muted }}>{day}</Text>
          </View>
        ))}
      </View>
      <View className="flex-row flex-wrap">{days}</View>
    </View>
  );
}

export default function DeviceDetailScreen() {
  const goBack = useBackNavigation("/home");
  const params = useLocalSearchParams<{ id?: string; homeId?: string }>();
  const [selectedRange, setSelectedRange] = useState<RangeValue>("7d");
  const [customFrom, setCustomFrom] = useState(dateFromDaysAgo(14));
  const [customTo, setCustomTo] = useState(toDateInputValue(new Date()));
  const [draftFrom, setDraftFrom] = useState(customFrom);
  const [draftTo, setDraftTo] = useState(customTo);
  const [rangeSide, setRangeSide] = useState<"from" | "to">("from");
  const [rangeError, setRangeError] = useState<string | null>(null);
  const [showRangeModal, setShowRangeModal] = useState(false);
  const { selectedHomeId } = useSelectedHome();
  const homeId = params.homeId ?? selectedHomeId;
  const devicesQuery = useDevicesScreenQuery(homeId);
  const activeRange = useMemo(() => {
    if (selectedRange === "custom") return { from: customFrom, to: customTo };
    const option = RANGE_OPTIONS.find((item) => item.value === selectedRange);
    return {
      from: dateFromDaysAgo(option?.days ?? 7),
      to: toDateInputValue(new Date()),
    };
  }, [customFrom, customTo, selectedRange]);
  const safetySummaryQuery = useSafetySummaryQuery(homeId);
  const wellnessSummaryQuery = useWellnessSummaryQuery(homeId, activeRange.from, activeRange.to);
  const analyticsQuery = useElderAnalyticsQuery({
    ...activeRange,
    homeId: homeId ?? undefined,
    deviceId: params.id,
  });
  const device = devicesQuery.data?.devices.find((item) => item.id === params.id);
  const shield = device ? isDoraShieldDevice(device) : false;
  const title = device ? (shield ? "DoraShield" : "DoraBot") : "Device";
  const Icon = shield ? ShieldCheck : RouterIcon;

  const connectedWifi = device?.wifiSsid ?? "Not configured";
  const deviceRoom = device?.roomCategory?.name ?? "Home level";
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
  const analyticsData = analyticsQuery.data;
  const emotionTotal = analyticsData?.totals.voiceInteractions ?? 0;
  const totalCritical = analyticsData ? analyticsData.totals.falls + analyticsData.totals.sos : 0;
  const maxEmotionCount = Math.max(1, ...Object.values(analyticsData?.emotionTotals ?? {}));
  const topIntents = Object.entries(analyticsData?.intentBreakdown ?? {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const openCustomRange = () => {
    setDraftFrom(customFrom);
    setDraftTo(customTo);
    setRangeSide("from");
    setRangeError(null);
    setShowRangeModal(true);
  };

  const applyCustomRange = () => {
    const fromTime = new Date(draftFrom).getTime();
    const toTime = new Date(draftTo).getTime();
    if (!draftFrom || !draftTo || Number.isNaN(fromTime) || Number.isNaN(toTime)) {
      setRangeError("Use YYYY-MM-DD format.");
      return;
    }
    if (fromTime > toTime) {
      setRangeError("Start date must be before end date.");
      return;
    }
    setCustomFrom(draftFrom);
    setCustomTo(draftTo);
    setSelectedRange("custom");
    setShowRangeModal(false);
  };

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

          <View className="mt-5 rounded-[24px] border bg-white p-3" style={{ borderColor: COLORS.line }}>
            <View className="mb-3 flex-row items-center justify-between px-1">
              <Text className="text-[13px] font-extrabold uppercase" style={{ color: COLORS.muted }}>
                Analytics range
              </Text>
              <Text className="text-[12px] font-bold" style={{ color: COLORS.text }}>
                {shortDate(activeRange.from)} - {shortDate(activeRange.to)}
              </Text>
            </View>
            <View className="flex-row gap-2">
              {RANGE_OPTIONS.map((opt) => {
                const active = selectedRange === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    className="h-10 flex-1 flex-row items-center justify-center rounded-full"
                    style={{ backgroundColor: active ? COLORS.coral : COLORS.surfaceMuted }}
                    activeOpacity={0.78}
                    onPress={() => {
                      if (opt.value === "custom") openCustomRange();
                      else setSelectedRange(opt.value);
                    }}
                  >
                    {opt.value === "custom" ? (
                      <CalendarDays size={18} color={active ? "#fff" : COLORS.muted} />
                    ) : (
                      <Text className="text-[13px] font-extrabold" style={{ color: active ? "#fff" : COLORS.muted }}>
                        {opt.label}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View className="mt-4 rounded-[24px] border bg-white p-5" style={{ borderColor: COLORS.line }}>
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
              helper={wellnessSummary ? `Score ${wellnessSummary.distressScore} · ${wellnessSummary.distressLevel}` : "Home signal"}
              progress={wellnessSummary ? Math.max(0, 100 - wellnessSummary.distressScore) : 78}
              color={wellnessAccent}
              Icon={Activity}
            />
          </View>

          <View className="mt-5 rounded-[26px] border bg-white p-5" style={{ borderColor: COLORS.line }}>
            <Text className="text-[13px] font-extrabold uppercase" style={{ color: COLORS.muted }}>
              Connection
            </Text>
            <View className="mt-4 flex-row gap-3">
              <View className="flex-1 rounded-[20px] p-4" style={{ backgroundColor: COLORS.surfaceMuted }}>
                <View className="mb-3 h-10 w-10 items-center justify-center rounded-[15px] bg-white">
                  <Wifi size={20} color={COLORS.coral} />
                </View>
                <Text className="text-[12px] font-bold" style={{ color: COLORS.muted }}>
                  Wi-Fi
                </Text>
                <Text className="mt-1 text-[17px] font-extrabold" style={{ color: COLORS.text }} numberOfLines={1}>
                  {shield ? "DoraShield" : connectedWifi}
                </Text>
              </View>
              <View className="flex-1 rounded-[20px] p-4" style={{ backgroundColor: COLORS.surfaceMuted }}>
                <View className="mb-3 h-10 w-10 items-center justify-center rounded-[15px] bg-white">
                  <RouterIcon size={20} color={COLORS.coral} />
                </View>
                <Text className="text-[12px] font-bold" style={{ color: COLORS.muted }}>
                  Room
                </Text>
                <Text className="mt-1 text-[17px] font-extrabold" style={{ color: COLORS.text }} numberOfLines={1}>
                  {deviceRoom}
                </Text>
              </View>
            </View>
          </View>

          {!shield ? (
            <View className="mt-8 rounded-[26px] border bg-white p-5" style={{ borderColor: COLORS.line }}>
              <View className="mb-4 flex-row items-start justify-between">
                <View className="flex-1 pr-4">
                  <Text className="text-[13px] font-extrabold uppercase" style={{ color: COLORS.muted }}>
                    Elder analytics
                  </Text>
                  <Text className="mt-1 text-[22px] font-extrabold" style={{ color: COLORS.text }}>
                    {analyticsQuery.isLoading ? "Loading..." : `${emotionTotal} voice interaction${emotionTotal === 1 ? "" : "s"}`}
                  </Text>
                  <Text className="mt-1 text-[13px] font-semibold leading-5" style={{ color: COLORS.muted }}>
                    Per-device view for {device.name} during {shortDate(activeRange.from)} - {shortDate(activeRange.to)}.
                  </Text>
                </View>
                <View className="h-[58px] w-[58px] items-center justify-center rounded-[20px]" style={{ backgroundColor: totalCritical > 0 ? COLORS.coralSoft : COLORS.surfaceMuted }}>
                  <Text className="text-[19px] font-extrabold" style={{ color: totalCritical > 0 ? COLORS.coral : COLORS.success }}>
                    {totalCritical}
                  </Text>
                  <Text className="text-[10px] font-bold uppercase" style={{ color: COLORS.muted }}>
                    alerts
                  </Text>
                </View>
              </View>

              {analyticsData ? (
                <>
                  <View className="flex-row gap-3">
                    <View className="flex-1 rounded-[20px] p-4" style={{ backgroundColor: COLORS.surfaceMuted }}>
                      <Text className="text-[12px] font-bold" style={{ color: COLORS.muted }}>Avg response</Text>
                      <Text className="mt-1 text-[20px] font-extrabold" style={{ color: COLORS.text }}>{formatMs(analyticsData.avgResponseTimeMs)}</Text>
                    </View>
                    <View className="flex-1 rounded-[20px] p-4" style={{ backgroundColor: COLORS.surfaceMuted }}>
                      <Text className="text-[12px] font-bold" style={{ color: COLORS.muted }}>Voice latency</Text>
                      <Text className="mt-1 text-[20px] font-extrabold" style={{ color: COLORS.text }}>{formatMs(analyticsData.avgVoiceLatencyMs)}</Text>
                    </View>
                  </View>

                  {emotionTotal > 0 ? (
                    <View className="mt-5">
                      {Object.entries(analyticsData.emotionTotals)
                        .filter(([, count]) => count > 0)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5)
                        .map(([emotion, count]) => {
                          const pct = Math.max(6, Math.round((count / maxEmotionCount) * 100));
                          const color = EMOTION_COLORS[emotion] ?? COLORS.muted;
                          return (
                            <View key={emotion} className="mb-3">
                              <View className="mb-1.5 flex-row items-center justify-between">
                                <Text className="text-[13px] font-extrabold" style={{ color: COLORS.text }}>{readableLabel(emotion)}</Text>
                                <Text className="text-[13px] font-bold" style={{ color: COLORS.muted }}>{count}</Text>
                              </View>
                              <View className="h-2.5 overflow-hidden rounded-full" style={{ backgroundColor: COLORS.surfaceMuted }}>
                                <View className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                              </View>
                            </View>
                          );
                        })}
                    </View>
                  ) : (
                    <Text className="mt-5 text-[13px] font-semibold leading-5" style={{ color: COLORS.muted }}>
                      No voice analytics recorded for this device in this range.
                    </Text>
                  )}

                  {topIntents.length > 0 ? (
                    <View className="mt-3 flex-row flex-wrap gap-2">
                      {topIntents.map(([intent, count]) => (
                        <View key={intent} className="rounded-full px-3 py-2" style={{ backgroundColor: COLORS.surfaceMuted }}>
                          <Text className="text-[12px] font-extrabold" style={{ color: COLORS.text }}>
                            {readableLabel(intent)} · {count}
                          </Text>
                        </View>
                      ))}
                    </View>
                  ) : null}
                </>
              ) : analyticsQuery.isLoading ? null : (
                <Text className="text-[13px] font-semibold leading-5" style={{ color: COLORS.muted }}>
                  No analytics available for this device yet.
                </Text>
              )}
            </View>
          ) : null}

          {!shield && wellnessSummary ? (
            <View className="mt-8 rounded-[24px] border bg-white p-5" style={{ borderColor: COLORS.line }}>
              <View className="mb-4 flex-row items-center justify-between">
                <View>
                  <Text className="text-[13px] font-extrabold uppercase" style={{ color: COLORS.muted }}>
                    Voice Emotion
                  </Text>
                  <Text className="mt-0.5 text-[18px] font-extrabold" style={{ color: COLORS.text }}>
                    {wellnessSummary.voiceEmotionSummary.totalInteractions} interaction{wellnessSummary.voiceEmotionSummary.totalInteractions !== 1 ? "s" : ""}
                  </Text>
                </View>
                {wellnessSummary.voiceEmotionSummary.dominantEmotion ? (
                  <View
                    className="rounded-full px-3 py-1.5"
                    style={{ backgroundColor: EMOTION_COLORS[wellnessSummary.voiceEmotionSummary.dominantEmotion] + "22" }}
                  >
                    <Text
                      className="text-[12px] font-extrabold"
                      style={{ color: EMOTION_COLORS[wellnessSummary.voiceEmotionSummary.dominantEmotion] }}
                    >
                      {EMOTION_LABELS[wellnessSummary.voiceEmotionSummary.dominantEmotion]}
                    </Text>
                  </View>
                ) : (
                  <View className="rounded-full px-3 py-1.5" style={{ backgroundColor: COLORS.surfaceMuted }}>
                    <Text className="text-[12px] font-extrabold" style={{ color: COLORS.muted }}>No data</Text>
                  </View>
                )}
              </View>

              {wellnessSummary.voiceEmotionSummary.totalInteractions > 0 ? (
                <>
                  {(["distressed", "anxious", "sad", "positive", "neutral"] as const).map((key) => {
                    const count = wellnessSummary.voiceEmotionSummary.breakdown[key];
                    if (count === 0) return null;
                    return (
                      <EmotionBar
                        key={key}
                        label={EMOTION_LABELS[key]}
                        count={count}
                        total={wellnessSummary.voiceEmotionSummary.totalInteractions}
                        color={EMOTION_COLORS[key]}
                      />
                    );
                  })}
                </>
              ) : (
                <Text className="text-[13px] font-semibold leading-5" style={{ color: COLORS.muted }}>
                  No voice interactions recorded in this period. DoraBot will start tracking emotions as the elder speaks.
                </Text>
              )}

              <View className="mt-3 h-px" style={{ backgroundColor: COLORS.line }} />
              <Text className="mt-3 text-[13px] font-semibold leading-5" style={{ color: COLORS.muted }}>
                {wellnessSummary.recommendation}
              </Text>

              {wellnessSummary.careSignals.length > 0 ? (
                <View className="mt-3 gap-1.5">
                  {wellnessSummary.careSignals.map((signal, i) => (
                    <View key={i} className="flex-row items-start">
                      <Text style={{ color: COLORS.coral, marginTop: 2 }}>• </Text>
                      <Text className="flex-1 text-[13px] font-semibold leading-5" style={{ color: COLORS.text }}>
                        {signal}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          ) : null}

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
              </>
            ) : (
              <>
                <ActionRow
                  title="Review shield setup"
                  description="Check how DoraShield should be worn before pairing."
                  Icon={Bell}
                  onPress={() => router.push("/device-setup?type=dorashield" as never)}
                />
              </>
            )}
          </View>
        </ScrollView>

        <Modal
          transparent
          visible={showRangeModal}
          animationType="fade"
          accessibilityViewIsModal
          onRequestClose={() => setShowRangeModal(false)}
        >
          <Pressable className="flex-1 justify-end bg-black/40" onPress={() => setShowRangeModal(false)}>
            <Pressable
              className="rounded-t-[28px] bg-white px-7 pb-8 pt-7"
              accessibilityRole="summary"
              accessibilityLabel="Custom analytics range"
              onPress={(event) => event.stopPropagation()}
            >
              <View className="mb-5 h-1.5 w-12 self-center rounded-full bg-[#E8ECEF]" />
              <Text className="text-center text-[22px] font-extrabold" style={{ color: COLORS.text }}>
                Custom range
              </Text>
              <Text className="mt-2 text-center text-[13px] font-semibold leading-5" style={{ color: COLORS.muted }}>
                Pick the analytics period for this device.
              </Text>
              <View className="mt-6 flex-row gap-3">
                {(["from", "to"] as const).map((side) => {
                  const active = rangeSide === side;
                  const value = side === "from" ? draftFrom : draftTo;
                  return (
                    <Pressable
                      key={side}
                      className="h-[58px] flex-1 items-center justify-center rounded-[18px] border"
                      style={{ borderColor: active ? COLORS.coral : COLORS.line, backgroundColor: active ? COLORS.coralSoft : "#fff" }}
                      onPress={() => setRangeSide(side)}
                    >
                      <Text className="text-[11px] font-extrabold uppercase" style={{ color: active ? COLORS.coral : COLORS.muted }}>
                        {side}
                      </Text>
                      <Text className="mt-1 text-[15px] font-extrabold" style={{ color: COLORS.text }}>
                        {shortDate(value)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <View className="mt-5">
                <CalendarPicker
                  value={rangeSide === "from" ? draftFrom : draftTo}
                  onChange={(value) => {
                    if (rangeSide === "from") setDraftFrom(value);
                    else setDraftTo(value);
                  }}
                />
              </View>
              {rangeError ? (
                <Text className="mt-3 text-[13px] font-semibold" style={{ color: COLORS.coral }}>
                  {rangeError}
                </Text>
              ) : null}
              <View className="mt-7 flex-row gap-3">
                <Pressable
                  className="h-[52px] flex-1 items-center justify-center rounded-2xl border"
                  style={{ borderColor: COLORS.line }}
                  onPress={() => setShowRangeModal(false)}
                >
                  <Text className="text-[15px] font-extrabold" style={{ color: COLORS.muted }}>
                    Cancel
                  </Text>
                </Pressable>
                <Pressable
                  className="h-[52px] flex-1 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: COLORS.coral }}
                  onPress={applyCustomRange}
                >
                  <Text className="text-[15px] font-extrabold text-white">
                    Apply
                  </Text>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    </SafeAreaView>
  );
}
