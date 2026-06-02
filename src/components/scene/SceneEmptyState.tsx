import React from "react";
import { Text, View } from "react-native";
import { Bell, MousePointerClick } from "lucide-react-native";
import { COLORS } from "@/constants/theme";
import { SceneMode } from "@/types/scene.types";

type SceneEmptyStateProps = {
  mode: SceneMode;
};

export function SceneEmptyState({ mode }: SceneEmptyStateProps) {
  const isAutomation = mode === "automation";
  const Icon = isAutomation ? Bell : MousePointerClick;

  return (
    <View className="min-h-[420px] items-center justify-center px-8 pb-20">
      <Icon size={58} color="#B8B8B8" strokeWidth={1.7} />
      <Text
        className="mt-7 text-center text-[18px] font-extrabold leading-6"
        style={{ color: COLORS.muted }}
      >
        {isAutomation ? "No automation yet" : "No tap-to-run yet"}
      </Text>
      <Text
        className="mt-2 text-center text-[14px] font-semibold leading-5"
        style={{ color: COLORS.muted }}
      >
        Tap the plus button to create one.
      </Text>
    </View>
  );
}
