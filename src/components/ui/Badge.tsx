import React from "react";
import { View, Text } from "react-native";
import { AlertPriority } from "@/types/alert.types";

const priorityConfig: Record<
  AlertPriority,
  { label: string; bgClass: string; textClass: string }
> = {
  critical: {
    label: "Darurat",
    bgClass: "bg-red-100",
    textClass: "text-red-700",
  },
  high: {
    label: "Tinggi",
    bgClass: "bg-orange-100",
    textClass: "text-orange-700",
  },
  medium: {
    label: "Sedang",
    bgClass: "bg-yellow-100",
    textClass: "text-yellow-700",
  },
  low: {
    label: "Info",
    bgClass: "bg-green-100",
    textClass: "text-green-700",
  },
};

export const Badge = ({ priority }: { priority: AlertPriority }) => {
  const config = priorityConfig[priority];
  return (
    <View className={`px-3 py-1 rounded-full ${config.bgClass}`}>
      <Text className={`text-xs font-semibold ${config.textClass}`}>
        {config.label}
      </Text>
    </View>
  );
};
