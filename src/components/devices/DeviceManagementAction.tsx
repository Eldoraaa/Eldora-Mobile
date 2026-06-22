import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { LucideIcon } from "lucide-react-native";
import { COLORS } from "@/constants/theme";

type DeviceManagementActionProps = {
  Icon: LucideIcon;
  label: string;
  disabled: boolean;
  onPress: () => void;
};

export function DeviceManagementAction({
  Icon,
  label,
  disabled,
  onPress,
}: DeviceManagementActionProps) {
  return (
    <TouchableOpacity
      className="flex-1 items-center justify-center"
      activeOpacity={0.78}
      disabled={disabled}
      onPress={onPress}
    >
      <Icon size={25} color={disabled ? COLORS.line : COLORS.text} />
      <Text
        className="mt-2 text-center text-[12px] font-medium leading-4"
        style={{ color: disabled ? COLORS.line : COLORS.text }}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.82}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
