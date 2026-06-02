import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { ChevronRight } from "lucide-react-native";

export type AlertCardTone = "critical" | "attention" | "ok";

type AlertCardProps = {
  tone?: AlertCardTone;
  icon: React.ReactNode;
  title: string;
  body: string;
  meta: string;
  action?: string;
  onPress?: () => void;
};

const toneStyles: Record<
  AlertCardTone,
  { borderColor: string; iconBackground: string }
> = {
  critical: {
    borderColor: "#E53E3E",
    iconBackground: "#FEE2E2",
  },
  attention: {
    borderColor: "#E79A44",
    iconBackground: "#FFF3DF",
  },
  ok: {
    borderColor: "#E7E1DA",
    iconBackground: "#EAF8F0",
  },
};

export function AlertCard({
  tone = "ok",
  icon,
  title,
  body,
  meta,
  action,
  onPress,
}: AlertCardProps) {
  const styles = toneStyles[tone];

  return (
    <TouchableOpacity
      disabled={!onPress}
      onPress={onPress}
      activeOpacity={0.86}
      className="rounded-[22px] border bg-white p-4"
      style={{ borderColor: styles.borderColor }}
      accessibilityRole={onPress ? "button" : undefined}
    >
      <View className="flex-row items-start gap-3">
        <View
          className="h-12 w-12 items-center justify-center rounded-2xl"
          style={{ backgroundColor: styles.iconBackground }}
        >
          {icon}
        </View>
        <View className="flex-1">
          <Text className="text-[15px] font-extrabold text-eldora-text">
            {title}
          </Text>
          <Text className="mt-1 text-[13px] leading-5 text-eldora-text-muted">
            {body}
          </Text>
          <View className="mt-3 flex-row items-center justify-between">
            <Text className="text-[12px] font-bold text-eldora-text-muted">
              {meta}
            </Text>
            {action ? (
              <View className="flex-row items-center">
                <Text className="text-[12px] font-bold text-eldora-coral">
                  {action}
                </Text>
                <ChevronRight size={14} color="#D95545" />
              </View>
            ) : null}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
