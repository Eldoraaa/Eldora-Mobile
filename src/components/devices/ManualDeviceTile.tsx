import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { LucideIcon } from "lucide-react-native";
import { COLORS } from "@/constants/theme";

type ManualDeviceTileProps = {
  title: string;
  Icon: LucideIcon;
  onPress: () => void;
};

export function ManualDeviceTile({
  title,
  Icon,
  onPress,
}: ManualDeviceTileProps) {
  return (
    <TouchableOpacity
      className="mb-8 w-1/4 items-center"
      activeOpacity={0.78}
      onPress={onPress}
    >
      <View
        className="h-[58px] w-[58px] items-center justify-center rounded-[18px]"
        style={{ backgroundColor: COLORS.surfaceMuted }}
      >
        <Icon size={25} color={COLORS.coral} />
      </View>
      <Text
        className="mt-3 text-center text-[13px] font-semibold leading-5"
        style={{ color: COLORS.text }}
        numberOfLines={2}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}
