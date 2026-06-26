import React from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { Bell, CheckCircle2, Clock3, Home, Router, UserRound, XCircle } from "lucide-react-native";
import { ScreenHeader } from "@/components/navigation/ScreenHeader";
import { COLORS } from "@/constants/theme";
import { useBackNavigation } from "@/hooks/useBackNavigation";
import { useSelectedHome } from "@/hooks/useSelectedHome";
import {
  useAcknowledgeElderReminderMutation,
  useCancelElderReminderMutation,
  useElderReminderQuery,
} from "@/hooks/useVoiceQueries";
import { ElderReminder } from "@/types/voice.types";

function formatDateTime(value: string | null) {
  if (!value) return "--";
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between py-4">
      <Text className="text-[13px] font-extrabold uppercase" style={{ color: COLORS.disabled }}>{label}</Text>
      <Text className="ml-4 max-w-[58%] text-right text-[15px] font-bold" style={{ color: COLORS.text }} numberOfLines={3}>{value}</Text>
    </View>
  );
}

function statusColor(status: ElderReminder["status"]) {
  if (status === "delivered" || status === "acknowledged") return COLORS.success;
  if (status === "failed" || status === "cancelled") return COLORS.coral;
  if (status === "queued") return COLORS.warning;
  return COLORS.muted;
}

function TimelineItem({ label, active, color }: { label: string; active: boolean; color: string }) {
  return (
    <View className="flex-row items-center py-2">
      <View className="mr-3 h-7 w-7 items-center justify-center rounded-full" style={{ backgroundColor: active ? color : COLORS.surfaceMuted }}>
        <CheckCircle2 size={15} color={active ? "#fff" : COLORS.disabled} />
      </View>
      <Text className="text-[14px] font-bold" style={{ color: active ? COLORS.text : COLORS.muted }}>{label}</Text>
    </View>
  );
}

export default function ReminderDetailScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const goBack = useBackNavigation("/reminders");
  const { selectedHomeId } = useSelectedHome();
  const reminderQuery = useElderReminderQuery(params.id);
  const cancelMutation = useCancelElderReminderMutation(selectedHomeId);
  const ackMutation = useAcknowledgeElderReminderMutation(selectedHomeId);
  const reminder = reminderQuery.data;
  const busy = cancelMutation.isPending || ackMutation.isPending;

  const cancelReminder = async () => {
    if (!reminder) return;
    try {
      await cancelMutation.mutateAsync(reminder.id);
      Toast.show({ type: "success", text1: "Reminder cancelled" });
    } catch {
      Toast.show({ type: "error", text1: "Reminder was not cancelled" });
    }
  };

  const acknowledgeReminder = async () => {
    if (!reminder) return;
    try {
      await ackMutation.mutateAsync(reminder.id);
      Toast.show({ type: "success", text1: "Reminder acknowledged" });
    } catch {
      Toast.show({ type: "error", text1: "Reminder was not acknowledged" });
    }
  };

  if (reminderQuery.isLoading || !reminder) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="mx-auto w-full max-w-[430px] flex-1 bg-white">
          <ScreenHeader title="Reminder Detail" onBack={goBack} />
          <View className="flex-1 items-center justify-center pb-20">
            <ActivityIndicator color={COLORS.coral} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const canCancel = reminder.status === "pending" || reminder.status === "queued" || reminder.status === "needs_confirmation";
  const canAck = reminder.status === "delivered";
  const created = true;
  const queued = ["queued", "delivered", "acknowledged"].includes(reminder.status);
  const delivered = ["delivered", "acknowledged"].includes(reminder.status);
  const finished = ["acknowledged", "cancelled", "failed"].includes(reminder.status);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="mx-auto w-full max-w-[430px] flex-1 bg-white">
        <ScreenHeader title="Reminder Detail" onBack={goBack} />
        <ScrollView className="flex-1" contentContainerClassName="px-6 pb-12 pt-6" showsVerticalScrollIndicator={false}>
          <View className="overflow-hidden rounded-[26px] px-6 py-7" style={{ backgroundColor: COLORS.warmPanel }}>
            <View className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/40" />
            <View className="flex-row items-start">
              <View className="mr-5 h-16 w-16 items-center justify-center rounded-[22px] bg-white">
                <Bell size={32} color={COLORS.coral} />
              </View>
              <View className="flex-1">
                <Text className="text-[13px] font-extrabold uppercase" style={{ color: statusColor(reminder.status) }}>
                  {reminder.status.replace(/_/g, " ")}
                </Text>
                <Text className="mt-2 text-[24px] font-extrabold leading-8" style={{ color: COLORS.text }}>
                  {reminder.title}
                </Text>
                <Text className="mt-2 text-[14px] font-semibold leading-6" style={{ color: COLORS.muted }}>
                  {reminder.message}
                </Text>
              </View>
            </View>
          </View>

          <View className="mt-7 rounded-[24px] bg-white px-1">
            <DetailRow label="Due" value={formatDateTime(reminder.dueAt)} />
            <DetailRow label="Created" value={formatDateTime(reminder.createdAt)} />
            <DetailRow label="Delivered" value={formatDateTime(reminder.deliveredAt)} />
            <DetailRow label="Failed" value={formatDateTime(reminder.failedAt)} />
            <DetailRow label="Attempts" value={String(reminder.attemptCount)} />
            <DetailRow label="Timezone" value={reminder.timezone} />
          </View>

          <View className="mt-7 rounded-[24px] border bg-white p-5" style={{ borderColor: COLORS.line }}>
            <Text className="mb-3 text-[13px] font-extrabold uppercase" style={{ color: COLORS.muted }}>Timeline</Text>
            <TimelineItem label="Created by DoraBot voice" active={created} color={COLORS.coral} />
            <TimelineItem label="Queued to device" active={queued} color={COLORS.warning} />
            <TimelineItem label="Spoken by DoraBot" active={delivered} color={COLORS.success} />
            <TimelineItem label={reminder.status === "cancelled" ? "Cancelled" : reminder.status === "failed" ? "Failed" : "Acknowledged"} active={finished} color={statusColor(reminder.status)} />
          </View>

          <View className="mt-7 rounded-[24px] border bg-white p-5" style={{ borderColor: COLORS.line }}>
            <View className="mb-4 flex-row items-center">
              <UserRound size={18} color={COLORS.coral} />
              <Text className="ml-2 text-[15px] font-extrabold" style={{ color: COLORS.text }}>{reminder.elderProfile.name}</Text>
            </View>
            <View className="mb-4 flex-row items-center">
              <Router size={18} color={COLORS.coral} />
              <Text className="ml-2 text-[15px] font-extrabold" style={{ color: COLORS.text }}>{reminder.device.name ?? reminder.device.deviceId}</Text>
            </View>
            <View className="flex-row items-center">
              <Home size={18} color={COLORS.coral} />
              <Text className="ml-2 text-[15px] font-extrabold" style={{ color: COLORS.text }}>{reminder.home?.name ?? "No home"}</Text>
            </View>
          </View>

          {canCancel || canAck ? (
            <View className="mt-7 flex-row gap-3">
              {canAck ? (
                <TouchableOpacity className="h-14 flex-1 items-center justify-center rounded-[16px]" style={{ backgroundColor: COLORS.success }} disabled={busy} onPress={acknowledgeReminder}>
                  <Text className="text-[15px] font-extrabold text-white">Acknowledge</Text>
                </TouchableOpacity>
              ) : null}
              {canCancel ? (
                <TouchableOpacity className="h-14 flex-1 items-center justify-center rounded-[16px] border" style={{ borderColor: COLORS.line }} disabled={busy} onPress={cancelReminder}>
                  <Text className="text-[15px] font-extrabold" style={{ color: COLORS.coral }}>Cancel</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : null}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
