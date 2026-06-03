import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Bell, MousePointerClick } from "lucide-react-native";
import { COLORS } from "@/constants/theme";
import { EldoraDevice } from "@/types/device.types";
import { EldoraScene } from "@/types/scene.types";
import { getSceneDeviceSummary } from "@/utils/scene.utils";

type SceneListRowProps = {
  scene: EldoraScene;
  devicesById?: Map<string, EldoraDevice>;
  onPress?: () => void;
  onRun?: () => void;
  isRunning?: boolean;
};

export function SceneListRow({ scene, devicesById, onPress, onRun, isRunning }: SceneListRowProps) {
  const Icon = scene.mode === "tap" ? MousePointerClick : Bell;
  const deviceSummary = getSceneDeviceSummary(scene, devicesById);

  return (
    <TouchableOpacity
      className="flex-row items-center px-8 py-6"
      activeOpacity={0.78}
      onPress={onPress}
    >
      <View
        className="mr-5 h-[52px] w-[52px] items-center justify-center rounded-[18px]"
        style={{ backgroundColor: COLORS.surfaceMuted }}
      >
        <Icon size={24} color={scene.isEnabled ? COLORS.coral : COLORS.disabled} />
      </View>
      <View className="flex-1">
        <Text
          className="text-[17px] font-extrabold leading-6"
          style={{ color: COLORS.text }}
          numberOfLines={1}
        >
          {scene.name}
        </Text>
        <Text
          className="mt-1 text-[13px] font-semibold leading-5"
          style={{ color: COLORS.muted }}
          numberOfLines={1}
        >
          {deviceSummary || scene.triggerLabel}
          {scene.roomCategory ? ` | ${scene.roomCategory.name}` : ""}
        </Text>
      </View>
      {onRun ? (
        <TouchableOpacity
          className="ml-3 rounded-full px-4 py-2"
          style={{ backgroundColor: COLORS.coral }}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={`Run ${scene.name}`}
          disabled={isRunning}
          onPress={(event) => {
            event.stopPropagation();
            onRun();
          }}
        >
          <Text className="text-[13px] font-extrabold text-white">
            {isRunning ? "Running" : "Run"}
          </Text>
        </TouchableOpacity>
      ) : null}
    </TouchableOpacity>
  );
}
