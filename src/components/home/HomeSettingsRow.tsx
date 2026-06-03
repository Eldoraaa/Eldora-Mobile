import React from "react";
import { Pressable, Text } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { COLORS } from "@/constants/theme";

type HomeSettingsRowProps = {
  label: string;
  value?: string;
  onPress: () => void;
};

export function HomeSettingsRow({ label, value, onPress }: HomeSettingsRowProps) {
  return (
    <Pressable
      className="flex-row items-center px-8 py-5"
      accessibilityRole="button"
      accessibilityLabel={value ? `${label}, ${value}` : label}
      accessibilityHint="Double tap to open"
      onPress={onPress}
    >
      <Text
        className="flex-1 text-[16px] font-semibold leading-6"
        style={{ color: COLORS.text }}
      >
        {label}
      </Text>
      {value ? (
        <Text
          className="mr-1 max-w-[190px] text-right text-[14px] font-semibold leading-5"
          style={{ color: COLORS.muted }}
          numberOfLines={1}
        >
          {value}
        </Text>
      ) : null}
      <ChevronRight size={22} color={COLORS.disabled} />
    </Pressable>
  );
}
