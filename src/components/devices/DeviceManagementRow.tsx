import React, { useRef } from "react";
import { PanResponder, Pressable, Text, View } from "react-native";
import { Check, Router as RouterIcon, ShieldCheck } from "lucide-react-native";
import { COLORS } from "@/constants/theme";
import { EldoraDevice } from "@/types/device.types";
import { deviceRoomLabel, isWearableDevice } from "@/utils/device.utils";

const ROW_HEIGHT = 92;

type DeviceManagementRowProps = {
  device: EldoraDevice;
  index: number;
  selected: boolean;
  hidden: boolean;
  onToggle: () => void;
  onDrop: (fromIndex: number, toIndex: number) => void;
};

export function DeviceManagementRow({
  device,
  index,
  selected,
  hidden,
  onToggle,
  onDrop,
}: DeviceManagementRowProps) {
  const Icon = isWearableDevice(device) ? ShieldCheck : RouterIcon;
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_event, gesture) =>
        Math.abs(gesture.dy) > 10,
      onPanResponderRelease: (_event, gesture) => {
        const offset = Math.round(gesture.dy / ROW_HEIGHT);
        if (offset !== 0) onDrop(index, index + offset);
      },
    })
  ).current;

  return (
    <Pressable
      className={`flex-row items-center px-8 py-5 ${hidden ? "opacity-45" : ""}`}
      accessibilityRole="button"
      onPress={onToggle}
      {...panResponder.panHandlers}
    >
      <View
        className="mr-5 h-[54px] w-[54px] items-center justify-center rounded-[18px]"
        style={{ backgroundColor: COLORS.surfaceMuted }}
      >
        <View className="h-11 w-11 items-center justify-center rounded-[16px] bg-white">
          <Icon size={22} color={hidden ? COLORS.disabled : COLORS.coral} />
        </View>
      </View>

      <View className="flex-1 pr-4">
        <Text
          className="text-[18px] font-extrabold leading-6"
          style={{ color: COLORS.text }}
          numberOfLines={1}
        >
          {device.name}
        </Text>
        <Text
          className="mt-1 text-[14px] font-semibold leading-5"
          style={{ color: COLORS.muted }}
          numberOfLines={1}
        >
          {deviceRoomLabel(device)}
        </Text>
      </View>

      <View
        className="h-7 w-7 items-center justify-center rounded-full border"
        style={{
          borderColor: selected ? COLORS.coral : COLORS.disabled,
          backgroundColor: selected ? COLORS.coral : "#FFFFFF",
        }}
      >
        {selected ? <Check size={18} color="#FFFFFF" strokeWidth={3} /> : null}
      </View>
    </Pressable>
  );
}
