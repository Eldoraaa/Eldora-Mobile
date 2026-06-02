import React from "react";
import { Pressable, Text, View } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { COLORS } from "@/constants/theme";

type AccountSecurityRowProps = {
  title: string;
  value?: string;
  subtitle?: string;
  onPress?: () => void;
  destructive?: boolean;
  showChevron?: boolean;
};

export function AccountSecurityRow({
  title,
  value,
  subtitle,
  onPress,
  destructive = false,
  showChevron = Boolean(onPress),
}: AccountSecurityRowProps) {
  return (
    <Pressable
      className="min-h-[76px] flex-row items-center px-8"
      accessibilityRole={onPress ? "button" : undefined}
      disabled={!onPress}
      onPress={onPress}
    >
      <View className="flex-1 pr-4">
        <Text
          className="text-[16px] font-extrabold leading-6"
          style={{ color: destructive ? COLORS.coral : COLORS.text }}
          numberOfLines={1}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            className="mt-1 text-[15px] leading-5"
            style={{ color: COLORS.muted }}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      {value ? (
        <Text
          className="max-w-[170px] text-right text-[16px] leading-6"
          style={{ color: COLORS.muted }}
          numberOfLines={1}
        >
          {value}
        </Text>
      ) : null}
      {showChevron ? (
        <ChevronRight size={22} color={COLORS.disabled} strokeWidth={2.2} />
      ) : null}
    </Pressable>
  );
}
