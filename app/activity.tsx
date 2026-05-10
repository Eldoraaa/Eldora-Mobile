import React from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Activity, Clock, Router as RouterIcon } from "lucide-react-native";

function TimelineRow({
  title,
  subtitle,
  tone = "neutral",
}: {
  title: string;
  subtitle: string;
  tone?: "neutral" | "success";
}) {
  return (
    <View className="flex-row gap-3 rounded-[20px] bg-white p-4">
      <View
        className={`h-10 w-10 items-center justify-center rounded-2xl ${
          tone === "success" ? "bg-[#EAF8F0]" : "bg-[#EEF7FC]"
        }`}
      >
        {tone === "success" ? (
          <RouterIcon size={19} color="#22C55E" />
        ) : (
          <Clock size={19} color="#7BA7D4" />
        )}
      </View>
      <View className="flex-1">
        <Text className="text-[15px] font-bold text-[#1F2A37]">{title}</Text>
        <Text className="mt-1 text-[12px] leading-5 text-[#7B8794]">
          {subtitle}
        </Text>
      </View>
    </View>
  );
}

export default function ActivityScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="mx-auto w-full max-w-[430px] flex-1 px-4 pt-4">
        <View>
          <Text className="text-[13px] font-semibold text-[#7B8794]">
            Eldora Timeline
          </Text>
          <Text className="mt-1 text-[26px] font-bold text-[#1F2A37]">
            Activity
          </Text>
        </View>

        <ScrollView
          className="mt-5 flex-1"
          contentContainerClassName="gap-3 pb-5"
          showsVerticalScrollIndicator={false}
        >
          <View className="rounded-[26px] bg-[#F8FBFD] p-5">
            <View className="h-12 w-12 items-center justify-center rounded-2xl bg-white">
              <Activity size={22} color="#FF8A7A" />
            </View>
            <Text className="mt-4 text-xl font-bold text-[#1F2A37]">
              Hub events will appear here
            </Text>
            <Text className="mt-2 text-[13px] leading-5 text-[#7B8794]">
              Pairing, WiFi changes, heartbeat status, and future safety events
              will be collected in this timeline.
            </Text>
          </View>

          <TimelineRow
            title="Pairing ready"
            subtitle="Connect your first hub from the Hub tab."
            tone="success"
          />
          <TimelineRow
            title="Safety features next"
            subtitle="Fall alerts and sensor history can plug into this tab later."
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
