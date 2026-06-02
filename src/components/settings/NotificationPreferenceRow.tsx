import React, { useEffect, useState } from "react";
import { Pressable, Switch, Text, View } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { COLORS } from "@/constants/theme";

type NotificationPreferenceRowProps = {
  title: string;
  subtitle?: string;
  value?: string;
  onPress?: () => void;
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
};

function PreferenceSwitch({
  value,
  onValueChange,
}: {
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  return (
    <Switch
      value={localValue}
      onValueChange={(nextValue) => {
        setLocalValue(nextValue);
        onValueChange(nextValue);
      }}
      trackColor={{ false: COLORS.line, true: COLORS.coralSoft }}
      thumbColor={localValue ? COLORS.coral : "#FFFFFF"}
      ios_backgroundColor={COLORS.line}
    />
  );
}

export function NotificationPreferenceRow({
  title,
  subtitle,
  value,
  onPress,
  toggleValue,
  onToggle,
}: NotificationPreferenceRowProps) {
  const hasSwitch = typeof toggleValue === "boolean" && onToggle;

  return (
    <Pressable
      className="min-h-[78px] flex-row items-center px-8"
      accessibilityRole={onPress ? "button" : undefined}
      disabled={!onPress}
      onPress={onPress}
    >
      <View className="flex-1 pr-4">
        <Text
          className="text-[16px] font-extrabold leading-6"
          style={{ color: COLORS.text }}
          numberOfLines={1}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            className="mt-1 text-[14px] leading-5"
            style={{ color: COLORS.muted }}
            numberOfLines={2}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      {hasSwitch ? (
        <PreferenceSwitch value={toggleValue} onValueChange={onToggle} />
      ) : (
        <>
          {value ? (
            <Text
              className="max-w-[150px] text-right text-[16px] leading-6"
              style={{ color: COLORS.muted }}
              numberOfLines={1}
            >
              {value}
            </Text>
          ) : null}
          {onPress ? (
            <ChevronRight size={22} color={COLORS.disabled} strokeWidth={2.2} />
          ) : null}
        </>
      )}
    </Pressable>
  );
}
