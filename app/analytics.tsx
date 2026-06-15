import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenHeader } from "@/components/navigation/ScreenHeader";
import { COLORS } from "@/constants/theme";
import { useBackNavigation } from "@/hooks/useBackNavigation";
import { useElderAnalyticsQuery } from "@/hooks/useAnalyticsQuery";
import type { AnalyticsPeriod } from "@/api/analyticsApi";

// ── Helpers ───────────────────────────────────────────────────────────────────

function toISODate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function rangeFor(preset: Exclude<AnalyticsPeriod, "custom">): {
  from: string;
  to: string;
} {
  const to = new Date();
  const from = new Date();
  if (preset === "1d") from.setDate(from.getDate() - 1);
  else if (preset === "7d") from.setDate(from.getDate() - 7);
  else if (preset === "30d") from.setDate(from.getDate() - 30);
  else from.setDate(from.getDate() - 90);
  return { from: toISODate(from), to: toISODate(to) };
}

function formatMs(ms: number | null) {
  if (ms == null) return "—";
  if (ms < 60_000) return `${Math.round(ms / 1000)}s`;
  return `${Math.round(ms / 60_000)}m`;
}

function shortDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en", { month: "short", day: "numeric" });
}

function hourLabel(h: number) {
  if (h === 0) return "12am";
  if (h < 12) return `${h}am`;
  if (h === 12) return "12pm";
  return `${h - 12}pm`;
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, " ");
}

const EMOTION_COLOR: Record<string, string> = {
  distressed: "#D95545",
  anxious: "#D69E2E",
  sad: "#5F6B7A",
  happy: "#45A36B",
  calm: "#3B82F6",
  neutral: "#C4C4C4",
};

const PRESET_OPTIONS: { label: string; value: AnalyticsPeriod }[] = [
  { label: "Today", value: "1d" },
  { label: "7 Days", value: "7d" },
  { label: "30 Days", value: "30d" },
  { label: "90 Days", value: "90d" },
];

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: string }) {
  return (
    <Text
      className="px-5 pb-3 pt-7 text-[13px] font-semibold uppercase tracking-widest"
      style={{ color: COLORS.muted }}
    >
      {children}
    </Text>
  );
}

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <View
      className="flex-1 rounded-2xl border p-4"
      style={{ borderColor: COLORS.line, backgroundColor: COLORS.surfaceMuted }}
    >
      <Text
        className="mb-1 text-[12px] font-semibold"
        style={{ color: COLORS.muted }}
      >
        {label}
      </Text>
      <Text
        className="text-[22px] font-extrabold"
        style={{ color: accent ?? COLORS.text }}
      >
        {value}
      </Text>
      {sub ? (
        <Text className="mt-0.5 text-[11px]" style={{ color: COLORS.muted }}>
          {sub}
        </Text>
      ) : null}
    </View>
  );
}

function BarRow({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const pct = max > 0 ? Math.max(4, (value / max) * 100) : 0;
  return (
    <View className="mb-3 flex-row items-center">
      <Text
        className="w-[72px] text-[12px]"
        style={{ color: COLORS.muted }}
        numberOfLines={1}
      >
        {label}
      </Text>
      <View
        className="mx-2 h-[10px] flex-1 overflow-hidden rounded-full"
        style={{ backgroundColor: COLORS.line }}
      >
        <View
          style={{
            width: `${pct}%`,
            height: "100%",
            borderRadius: 999,
            backgroundColor: color,
          }}
        />
      </View>
      <Text
        className="w-7 text-right text-[12px] font-bold"
        style={{ color: COLORS.text }}
      >
        {value}
      </Text>
    </View>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AnalyticsScreen() {
  const goBack = useBackNavigation("/account");
  const [preset, setPreset] = useState<AnalyticsPeriod>("7d");
  const range = useMemo(() => rangeFor(preset as Exclude<AnalyticsPeriod, "custom">), [preset]);
  const { data, isLoading, refetch } = useElderAnalyticsQuery(range);

  // Max values for bar charts
  const maxVoicePerDay = useMemo(
    () => Math.max(1, ...(data?.voicePerDay.map((d) => d.total) ?? [0])),
    [data]
  );
  const maxActiveHour = useMemo(
    () => Math.max(1, ...(data?.activeHours.map((h) => h.count) ?? [0])),
    [data]
  );
  const maxIntent = useMemo(
    () => Math.max(1, ...Object.values(data?.intentBreakdown ?? {})),
    [data]
  );

  const topIntents = useMemo(
    () =>
      Object.entries(data?.intentBreakdown ?? {})
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6),
    [data]
  );

  const peakHours = useMemo(
    () =>
      (data?.activeHours ?? [])
        .filter((h) => h.count > 0)
        .sort((a, b) => b.count - a.count)
        .slice(0, 8),
    [data]
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="mx-auto w-full max-w-[430px] flex-1 bg-white">
        <ScreenHeader title="Elder Analytics" onBack={goBack} />

        {/* Date range presets */}
        <View className="flex-row gap-2 px-5 pb-2 pt-1">
          {PRESET_OPTIONS.map((opt) => {
            const active = preset === opt.value;
            return (
              <Pressable
                key={opt.value}
                onPress={() => setPreset(opt.value)}
                className="flex-1 items-center rounded-xl py-2"
                style={{
                  backgroundColor: active ? COLORS.coral : COLORS.surfaceMuted,
                  borderWidth: 1,
                  borderColor: active ? COLORS.coral : COLORS.line,
                }}
              >
                <Text
                  className="text-[13px] font-bold"
                  style={{ color: active ? "#fff" : COLORS.muted }}
                >
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text className="px-5 pb-2 text-[12px]" style={{ color: COLORS.muted }}>
          {shortDate(range.from)} — {shortDate(range.to)}
        </Text>

        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={COLORS.coral} size="large" />
          </View>
        ) : !data ? (
          <View className="flex-1 items-center justify-center px-8">
            <Text className="text-center text-[15px]" style={{ color: COLORS.muted }}>
              No data available for this period.
            </Text>
            <Pressable className="mt-4" onPress={() => refetch()}>
              <Text className="text-[14px] font-bold" style={{ color: COLORS.coral }}>
                Try again
              </Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView
            className="flex-1"
            contentContainerClassName="pb-12"
            showsVerticalScrollIndicator={false}
          >
            {/* ── Stat cards ── */}
            <SectionLabel>Overview</SectionLabel>
            <View className="flex-row gap-3 px-5">
              <StatCard
                label="Voice Interactions"
                value={String(data.totals.voiceInteractions)}
                sub={data.dominantEmotion ? `Mostly ${data.dominantEmotion}` : undefined}
              />
              <StatCard
                label="Critical Alerts"
                value={String(data.totals.falls + data.totals.sos)}
                sub={`${data.totals.falls} fall · ${data.totals.sos} SOS`}
                accent={data.totals.falls + data.totals.sos > 0 ? COLORS.coral : undefined}
              />
            </View>
            <View className="mt-3 flex-row gap-3 px-5">
              <StatCard
                label="Avg Response Time"
                value={formatMs(data.avgResponseTimeMs)}
                sub={
                  data.totals.resolvedAlerts > 0
                    ? `${data.totals.resolvedAlerts}/${data.totals.alerts} resolved`
                    : "No responses yet"
                }
              />
              <StatCard
                label="Voice Latency"
                value={formatMs(data.avgVoiceLatencyMs)}
                sub="Avg AI response time"
              />
            </View>

            {/* ── Emotion totals ── */}
            {data.totals.voiceInteractions > 0 && (
              <>
                <SectionLabel>Emotion Breakdown</SectionLabel>
                <View className="px-5">
                  {Object.entries(data.emotionTotals)
                    .filter(([, v]) => v > 0)
                    .sort((a, b) => b[1] - a[1])
                    .map(([state, count]) => (
                      <BarRow
                        key={state}
                        label={capitalize(state)}
                        value={count}
                        max={data.totals.voiceInteractions}
                        color={EMOTION_COLOR[state] ?? COLORS.muted}
                      />
                    ))}
                </View>
              </>
            )}

            {/* ── Voice per day ── */}
            {data.voicePerDay.some((d) => d.total > 0) && (
              <>
                <SectionLabel>Voice Activity per Day</SectionLabel>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerClassName="px-5 gap-2"
                >
                  {data.voicePerDay.map((day) => {
                    const h = Math.max(4, (day.total / maxVoicePerDay) * 80);
                    const dominantState =
                      day.distressed > 0
                        ? "distressed"
                        : day.anxious > 0
                          ? "anxious"
                          : day.sad > 0
                            ? "sad"
                            : day.happy > 0
                              ? "happy"
                              : day.calm > 0
                                ? "calm"
                                : "neutral";
                    return (
                      <View
                        key={day.date}
                        className="w-[44px] items-center"
                      >
                        <Text
                          className="mb-1 text-[10px] font-bold"
                          style={{ color: COLORS.text }}
                        >
                          {day.total > 0 ? day.total : ""}
                        </Text>
                        <View className="w-[28px] overflow-hidden rounded-lg" style={{ height: 80, justifyContent: "flex-end" }}>
                          <View
                            style={{
                              height: h,
                              backgroundColor:
                                day.total > 0
                                  ? EMOTION_COLOR[dominantState]
                                  : COLORS.line,
                              borderRadius: 6,
                            }}
                          />
                        </View>
                        <Text
                          className="mt-1 text-[10px]"
                          style={{ color: COLORS.muted }}
                          numberOfLines={1}
                        >
                          {shortDate(day.date)}
                        </Text>
                      </View>
                    );
                  })}
                </ScrollView>
              </>
            )}

            {/* ── Active hours ── */}
            {peakHours.length > 0 && (
              <>
                <SectionLabel>Peak Active Hours</SectionLabel>
                <View className="px-5">
                  {peakHours.map((h) => (
                    <BarRow
                      key={h.hour}
                      label={hourLabel(h.hour)}
                      value={h.count}
                      max={maxActiveHour}
                      color={COLORS.coral}
                    />
                  ))}
                </View>
              </>
            )}

            {/* ── Intent breakdown ── */}
            {topIntents.length > 0 && (
              <>
                <SectionLabel>What Elder Asks</SectionLabel>
                <View className="px-5">
                  {topIntents.map(([intent, count]) => (
                    <BarRow
                      key={intent}
                      label={capitalize(intent)}
                      value={count}
                      max={maxIntent}
                      color="#3B82F6"
                    />
                  ))}
                </View>
              </>
            )}

            {/* ── Alert summary ── */}
            {data.totals.alerts > 0 && (
              <>
                <SectionLabel>Alerts Summary</SectionLabel>
                <View className="mx-5 rounded-2xl border p-4" style={{ borderColor: COLORS.line }}>
                  {[
                    { label: "Fall Detections", value: data.totals.falls, color: COLORS.coral },
                    { label: "SOS Requests", value: data.totals.sos, color: COLORS.coral },
                    { label: "Voice Alerts", value: data.alertsPerDay.reduce((s, d) => s + d.voice, 0), color: COLORS.warning },
                    { label: "Total Alerts", value: data.totals.alerts, color: COLORS.text },
                    { label: "Resolved", value: data.totals.resolvedAlerts, color: COLORS.success },
                  ].map((row) => (
                    <View key={row.label} className="flex-row justify-between py-2" style={{ borderBottomWidth: 1, borderBottomColor: COLORS.line }}>
                      <Text className="text-[14px]" style={{ color: COLORS.muted }}>{row.label}</Text>
                      <Text className="text-[14px] font-bold" style={{ color: row.value > 0 ? row.color : COLORS.muted }}>
                        {row.value}
                      </Text>
                    </View>
                  ))}
                </View>
              </>
            )}

            {data.totals.voiceInteractions === 0 && data.totals.alerts === 0 && (
              <View className="mt-8 items-center px-8">
                <Text className="text-center text-[15px]" style={{ color: COLORS.muted }}>
                  No activity recorded in this period.
                </Text>
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}
