import React from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import { SafeAreaView } from "react-native-safe-area-context";
import { Brain, CheckCircle2, ShieldAlert, XCircle } from "lucide-react-native";
import { ScreenHeader } from "@/components/navigation/ScreenHeader";
import { COLORS } from "@/constants/theme";
import { useBackNavigation } from "@/hooks/useBackNavigation";
import {
  useApproveMemoryFactMutation,
  useMemoryFactsQuery,
  useRejectMemoryFactMutation,
} from "@/hooks/useVoiceQueries";
import { MemoryFact } from "@/types/memory.types";

function MemoryCard({ fact, busy, onApprove, onReject }: { fact: MemoryFact; busy: boolean; onApprove: () => void; onReject: () => void }) {
  const sensitive = fact.type === "safety" || fact.type === "medical";
  return (
    <View className="mb-4 rounded-[24px] border bg-white p-5" style={{ borderColor: COLORS.line }}>
      <View className="flex-row items-start">
        <View className="mr-4 h-12 w-12 items-center justify-center rounded-[18px]" style={{ backgroundColor: sensitive ? "#FEE2E2" : COLORS.surfaceMuted }}>
          {sensitive ? <ShieldAlert size={22} color={COLORS.coral} /> : <Brain size={22} color={COLORS.coral} />}
        </View>
        <View className="flex-1">
          <Text className="text-[12px] font-extrabold uppercase" style={{ color: COLORS.muted }}>
            {fact.elderProfile.name} · {fact.type}
          </Text>
          <Text className="mt-2 text-[17px] font-extrabold leading-6" style={{ color: COLORS.text }}>
            {fact.value}
          </Text>
          <Text className="mt-2 text-[13px] font-semibold" style={{ color: COLORS.muted }}>
            Confidence {Math.round(fact.confidence * 100)}% · {fact.key.replace(/_/g, " ")}
          </Text>
        </View>
      </View>
      <View className="mt-5 flex-row gap-3">
        <TouchableOpacity className="h-11 flex-1 flex-row items-center justify-center rounded-[14px]" style={{ backgroundColor: COLORS.success }} activeOpacity={0.82} disabled={busy} onPress={onApprove}>
          <CheckCircle2 size={17} color="#fff" />
          <Text className="ml-2 text-[14px] font-extrabold text-white">Approve</Text>
        </TouchableOpacity>
        <TouchableOpacity className="h-11 flex-1 flex-row items-center justify-center rounded-[14px] border" style={{ borderColor: COLORS.line }} activeOpacity={0.82} disabled={busy} onPress={onReject}>
          <XCircle size={17} color={COLORS.coral} />
          <Text className="ml-2 text-[14px] font-extrabold" style={{ color: COLORS.coral }}>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function MemoryReviewScreen() {
  const goBack = useBackNavigation("/settings");
  const factsQuery = useMemoryFactsQuery("candidate");
  const approveMutation = useApproveMemoryFactMutation("candidate");
  const rejectMutation = useRejectMemoryFactMutation("candidate");
  const facts = factsQuery.data ?? [];
  const busy = approveMutation.isPending || rejectMutation.isPending;

  const approve = async (factId: string) => {
    try {
      await approveMutation.mutateAsync(factId);
      Toast.show({ type: "success", text1: "Memory approved" });
    } catch {
      Toast.show({ type: "error", text1: "Memory was not approved" });
    }
  };

  const reject = async (factId: string) => {
    try {
      await rejectMutation.mutateAsync(factId);
      Toast.show({ type: "success", text1: "Memory rejected" });
    } catch {
      Toast.show({ type: "error", text1: "Memory was not rejected" });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="mx-auto w-full max-w-[430px] flex-1 bg-white">
        <ScreenHeader title="Memory Review" onBack={goBack} />
        <ScrollView className="flex-1" contentContainerClassName="px-6 pb-12 pt-6" showsVerticalScrollIndicator={false}>
          <Text className="text-[15px] font-semibold leading-6" style={{ color: COLORS.muted }}>
            Review sensitive or uncertain facts DoraBot learned before they are trusted long-term.
          </Text>
          {factsQuery.isLoading ? (
            <View className="mt-16 items-center"><ActivityIndicator color={COLORS.coral} /></View>
          ) : facts.length > 0 ? (
            <View className="mt-6">
              {facts.map((fact) => (
                <MemoryCard key={fact.id} fact={fact} busy={busy} onApprove={() => approve(fact.id)} onReject={() => reject(fact.id)} />
              ))}
            </View>
          ) : (
            <View className="mt-16 items-center rounded-[26px] px-8 py-10" style={{ backgroundColor: COLORS.surfaceMuted }}>
              <Brain size={40} color={COLORS.disabled} />
              <Text className="mt-4 text-center text-[18px] font-extrabold" style={{ color: COLORS.text }}>Nothing to review</Text>
              <Text className="mt-2 text-center text-[13px] font-semibold leading-5" style={{ color: COLORS.muted }}>
                New memory candidates will show up here after DoraBot conversations.
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
