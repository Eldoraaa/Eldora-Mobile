import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { COLORS } from "@/constants/theme";

type SceneFilterPillProps = {
  label: string;
  active: boolean;
  onPress: () => void;
};

export function SceneFilterPill({
  label,
  active,
  onPress,
}: SceneFilterPillProps) {
  return (
    <TouchableOpacity
      className="mr-3 rounded-full px-5 py-2"
      style={{ backgroundColor: active ? COLORS.surfaceMuted : "transparent" }}
      activeOpacity={0.76}
      onPress={onPress}
    >
      <Text
        className="text-[14px] font-semibold leading-5"
        style={{ color: active ? COLORS.text : COLORS.muted }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
