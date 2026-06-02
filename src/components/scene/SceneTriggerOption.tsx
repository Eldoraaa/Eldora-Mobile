import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { ChevronRight, LucideIcon } from "lucide-react-native";
import { COLORS } from "@/constants/theme";

type SceneTriggerOptionProps = {
  title: string;
  description: string;
  Icon: LucideIcon;
  color: string;
  onPress: () => void;
};

export function SceneTriggerOption({
  title,
  description,
  Icon,
  color,
  onPress,
}: SceneTriggerOptionProps) {
  return (
    <TouchableOpacity
      className="flex-row items-center px-8 py-5"
      activeOpacity={0.78}
      onPress={onPress}
    >
      <View
        className="mr-5 h-[48px] w-[48px] items-center justify-center rounded-[16px]"
        style={{ backgroundColor: COLORS.surfaceMuted }}
      >
        <Icon size={24} color={color} strokeWidth={2.3} />
      </View>
      <View className="flex-1">
        <Text
          className="text-[17px] font-extrabold leading-6"
          style={{ color: COLORS.text }}
          numberOfLines={1}
        >
          {title}
        </Text>
        <Text
          className="mt-1 text-[14px] font-semibold leading-5"
          style={{ color: COLORS.muted }}
          numberOfLines={2}
        >
          Example: {description}
        </Text>
      </View>
      <ChevronRight size={22} color={COLORS.disabled} strokeWidth={2.2} />
    </TouchableOpacity>
  );
}
