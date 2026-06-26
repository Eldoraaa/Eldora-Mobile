import React from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Bell, CheckCircle2, Clock3, XCircle } from "lucide-react-native";
import { ScreenHeader } from "@/components/navigation/ScreenHeader";
import { COLORS } from "@/constants/theme";
import { useBackNavigation } from "@/hooks/useBackNavigation";
import { useSelectedHome } from "@/hooks/useSelectedHome";
import {
  useAcknowledgeElderReminderMutation,
  useCancelElderReminderMutation,
  useElderRemindersQuery,
} from "@/hooks/useVoiceQueries";
import { ElderReminder } from "@/types/voice.types";

function formatReminderTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function statusColor(status: ElderReminder["status"]) {
  if (status === "delivered" || status === "acknowledged") return COLORS.success;
  if (status === "failed" || status === "cancelled") return COLORS.coral;
  if (status === "queued") return COLORS.warning;
  return COLORS.muted;
}

function ReminderCard({
  reminder,
  onCancel,
  onAck,
  onPress,
  busy,
}: {
  reminder: ElderReminder;
  onCancel: () => void;
  onAck: () => void;
  onPress: () => void;
  busy: boolean;
}) {
  const canCancel = reminder.status === "pending" || reminder.status === "queued" || reminder.status === "needs_confirmation";
  const canAck = reminder.status === "delivered";
  return (
    <TouchableOpacity className="mb-4 rounded-[24px] border bg-white p-5" style={{ borderColor: COLORS.line }} activeOpacity={0.82} onPress={onPress}>
      <View className="flex-row items-start">
        <View className="mr-4 h-12 w-12 items-center justify-center rounded-[18px]" style={{ backgroundColor: COLORS.surfaceMuted }}>
          <Bell size={22} color={COLORS.coral} />
        </View>
        <View className="flex-1">
          <Text className="text-[17px] font-extrabold leading-6" style={{ color: COLORS.text }}>
            {reminder.title}
          </Text>
          <Text className="mt-1 text-[13px] font-semibold leading-5" style={{ color: COLORS.muted }}>
            {reminder.message}
          </Text>
        </View>
      </View>
      <View className="mt-4 flex-row flex-wrap gap-2">
        <View className="flex-row items-center rounded-full px-3 py-2" style={{ backgroundColor: COLORS.surfaceMuted }}>
          <Clock3 size={13} color={COLORS.muted} />
          <Text className="ml-1.5 text-[12px] font-extrabold" style={{ color: COLORS.text }}>
            {formatReminderTime(reminder.dueAt)}
          </Text>
        </View>
        <View className="rounded-full px-3 py-2" style={{ backgroundColor: COLORS.surfaceMuted }}>
          <Text className="text-[12px] font-extrabold capitalize" style={{ color: statusColor(reminder.status) }}>
            {reminder.status.replace(/_/g, " ")}
          </Text>
        </View>
      </View>
      {canCancel || canAck ? (
        <View className="mt-4 flex-row gap-3">
          {canAck ? (
            <TouchableOpacity
              className="h-11 flex-1 flex-row items-center justify-center rounded-[14px]"
              style={{ backgroundColor: COLORS.success }}
              activeOpacity={0.82}
              disabled={busy}
              onPress={onAck}
            >
              <CheckCircle2 size={17} color="#fff" />
              <Text className="ml-2 text-[14px] font-extrabold text-white">Acknowledge</Text>
            </TouchableOpacity>
          ) : null}
          {canCancel ? (
            <TouchableOpacity
              className="h-11 flex-1 flex-row items-center justify-center rounded-[14px] border"
              style={{ borderColor: COLORS.line, backgroundColor: "#fff" }}
              activeOpacity={0.82}
              disabled={busy}
              onPress={onCancel}
            >
              <XCircle size={17} color={COLORS.coral} />
              <Text className="ml-2 text-[14px] font-extrabold" style={{ color: COLORS.coral }}>Cancel</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

export default function RemindersScreen() {
  const goBack = useBackNavigation("/alerts");
  const { selectedHomeId } = useSelectedHome();
  const remindersQuery = useElderRemindersQuery(selectedHomeId);
  const cancelMutation = useCancelElderReminderMutation(selectedHomeId);
  const ackMutation = useAcknowledgeElderReminderMutation(selectedHomeId);
  const reminders = remindersQuery.data ?? [];
  const busy = cancelMutation.isPending || ackMutation.isPending;

  const cancelReminder = async (reminderId: string) => {
    try {
      await cancelMutation.mutateAsync(reminderId);
      Toast.show({ type: "success", text1: "Reminder cancelled" });
    } catch {
      Toast.show({ type: "error", text1: "Reminder was not cancelled" });
    }
  };

  const acknowledgeReminder = async (reminderId: string) => {
    try {
      await ackMutation.mutateAsync(reminderId);
      Toast.show({ type: "success", text1: "Reminder acknowledged" });
    } catch {
      Toast.show({ type: "error", text1: "Reminder was not acknowledged" });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="mx-auto w-full max-w-[430px] flex-1 bg-white">
        <ScreenHeader title="DoraBot Reminders" onBack={goBack} />
        <ScrollView className="flex-1" contentContainerClassName="px-6 pb-12 pt-6" showsVerticalScrollIndicator={false}>
          <Text className="text-[15px] font-semibold leading-6" style={{ color: COLORS.muted }}>
            Voice reminders created by the elder through DoraBot.
          </Text>
          {remindersQuery.isLoading ? (
            <View className="mt-16 items-center">
              <ActivityIndicator color={COLORS.coral} />
            </View>
          ) : reminders.length > 0 ? (
            <View className="mt-6">
              {reminders.map((reminder) => (
                <ReminderCard
                  key={reminder.id}
                  reminder={reminder}
                  busy={busy}
                  onPress={() => router.push(`/reminder-detail?id=${reminder.id}` as never)}
                  onCancel={() => cancelReminder(reminder.id)}
                  onAck={() => acknowledgeReminder(reminder.id)}
                />
              ))}
            </View>
          ) : (
            <View className="mt-16 items-center rounded-[26px] px-8 py-10" style={{ backgroundColor: COLORS.surfaceMuted }}>
              <Bell size={40} color={COLORS.disabled} />
              <Text className="mt-4 text-center text-[18px] font-extrabold" style={{ color: COLORS.text }}>
                No reminders yet
              </Text>
              <Text className="mt-2 text-center text-[13px] font-semibold leading-5" style={{ color: COLORS.muted }}>
                When the elder asks DoraBot to remember something, it will appear here.
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
