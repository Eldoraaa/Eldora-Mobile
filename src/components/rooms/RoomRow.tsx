import React, { useRef } from "react";
import { PanResponder, Pressable, Text, TouchableOpacity, View } from "react-native";
import { Grip, Minus } from "lucide-react-native";
import { COLORS } from "@/constants/theme";
import { RoomCategory } from "@/types/device.types";

const ROOM_ROW_HEIGHT = 78;

type RoomRowProps = {
  room: RoomCategory;
  count: number;
  editing: boolean;
  index: number;
  onDelete: () => void;
  onDrop: (fromIndex: number, toIndex: number) => void;
};

export function RoomRow({
  room,
  count,
  editing,
  index,
  onDelete,
  onDrop,
}: RoomRowProps) {
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_event, gesture) =>
        editing && Math.abs(gesture.dy) > 10,
      onPanResponderRelease: (_event, gesture) => {
        if (!editing) return;
        const offset = Math.round(gesture.dy / ROOM_ROW_HEIGHT);
        if (offset !== 0) onDrop(index, index + offset);
      },
    })
  ).current;

  if (editing) {
    return (
      <View className="flex-row items-center px-8 py-5" {...panResponder.panHandlers}>
        <TouchableOpacity
          className="mr-5 h-8 w-8 items-center justify-center rounded-full"
          style={{ backgroundColor: COLORS.coral }}
          activeOpacity={0.78}
          onPress={onDelete}
          disabled={room.isDefault}
        >
          <Minus size={24} color="#FFFFFF" strokeWidth={3.2} />
        </TouchableOpacity>
        <Text
          className="flex-1 text-[17px] font-semibold leading-6"
          style={{ color: COLORS.text }}
          numberOfLines={1}
        >
          {room.name}
        </Text>
        <Text
          className="mr-5 text-[14px] font-semibold leading-5"
          style={{ color: COLORS.muted }}
        >
          {count} Device(s)
        </Text>
        <Grip size={30} color={COLORS.disabled} />
      </View>
    );
  }

  return (
    <View className="flex-row items-center px-8 py-5">
      <Text
        className="flex-1 text-[17px] font-semibold leading-6"
        style={{ color: COLORS.text }}
        numberOfLines={1}
      >
        {room.name}
      </Text>
      <Text
        className="text-[14px] font-semibold leading-5"
        style={{ color: COLORS.muted }}
      >
        {count} Device(s)
      </Text>
    </View>
  );
}
