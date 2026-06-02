import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { LucideIcon } from "lucide-react-native";
import { COLORS } from "@/constants/theme";

type DeonDeviceRowProps = {
  title: string;
  room: string;
  status?: string;
  Icon: LucideIcon;
  accent: string;
  onPress?: () => void;
};

export function DeonDeviceRow({
  title,
  room,
  status,
  Icon,
  accent,
  onPress,
}: DeonDeviceRowProps) {
  const isOffline = status === "Offline" || status === "Not paired";

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.78}
      className="flex-row items-center px-8 py-6"
    >
      <View
        className="mr-5 h-[56px] w-[56px] items-center justify-center rounded-[20px]"
        style={{ backgroundColor: COLORS.surfaceMuted }}
      >
        <View
          className="h-11 w-11 items-center justify-center rounded-[17px] bg-white"
          style={{
            shadowColor: COLORS.text,
            shadowOpacity: 0.1,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 4 },
            elevation: 2,
          }}
        >
          <Icon size={23} color={isOffline ? COLORS.disabled : accent} />
        </View>
      </View>
      <View className="flex-1">
        <Text
          className="text-[18px] font-extrabold leading-6"
          style={{ color: COLORS.text }}
          numberOfLines={1}
        >
          {title}
        </Text>
        <View className="mt-1 flex-row items-center">
          <Text
            className="text-[15px] font-semibold"
            style={{ color: COLORS.muted }}
            numberOfLines={1}
          >
            {room}
          </Text>
          {status ? (
            <>
              <Text
                className="mx-2 text-[15px]"
                style={{ color: COLORS.disabled }}
              >
                |
              </Text>
              <Text
                className="text-[15px] font-semibold"
                style={{ color: isOffline ? COLORS.warning : COLORS.success }}
              >
                {status}
              </Text>
            </>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}
