import React from "react";
import { Pressable, Text } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { COLORS } from "@/constants/theme";

type SettingsRowProps = {
  title: string;
  value?: string;
  onPress?: () => void;
  right?: React.ReactNode;
  destructive?: boolean;
  showChevron?: boolean;
};

export function SettingsRow({
  title,
  value,
  onPress,
  right,
  destructive = false,
  showChevron = Boolean(onPress),
}: SettingsRowProps) {
  return (
    <Pressable
      className="min-h-[64px] flex-row items-center px-8"
      accessibilityRole={onPress ? "button" : undefined}
      disabled={!onPress}
      onPress={onPress}
    >
      <Text
        className="flex-1 text-[16px] font-extrabold leading-6"
        style={{ color: destructive ? COLORS.coral : COLORS.text }}
        numberOfLines={1}
      >
        {title}
      </Text>
      {value ? (
        <Text
          className="ml-4 max-w-[170px] text-right text-[16px] font-normal leading-6"
          style={{ color: COLORS.muted }}
          numberOfLines={1}
        >
          {value}
        </Text>
      ) : null}
      {right ?? (
        <ChevronRight
          size={23}
          color={showChevron ? COLORS.disabled : "transparent"}
          strokeWidth={2.2}
        />
      )}
    </Pressable>
  );
}
