import React, { useMemo, useRef } from "react";
import { Animated, PanResponder, Text, TouchableOpacity, View } from "react-native";
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
  onDragMove: (fromIndex: number, toIndex: number) => void;
};

export function RoomRow({
  room,
  count,
  editing,
  index,
  onDelete,
  onDragMove,
}: RoomRowProps) {
  const translateY = useRef(new Animated.Value(0)).current;
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_event, gesture) =>
          editing && Math.abs(gesture.dy) > 8 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
        onPanResponderMove: (_event, gesture) => {
          translateY.setValue(gesture.dy);
          const offset = Math.round(gesture.dy / ROOM_ROW_HEIGHT);
          if (offset !== 0) {
            onDragMove(index, index + offset);
            translateY.setValue(0);
          }
        },
        onPanResponderRelease: () => {
          if (!editing) return;
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 80,
            friction: 10,
          }).start();
        },
        onPanResponderTerminate: () => {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 80,
            friction: 10,
          }).start();
        },
      }),
    [editing, index, onDragMove, translateY]
  );

  if (editing) {
    return (
      <Animated.View
        className="flex-row items-center px-8 py-5"
        style={{ transform: [{ translateY }] }}
      >
        <TouchableOpacity
          className="mr-5 h-8 w-8 items-center justify-center rounded-full"
          style={{ backgroundColor: room.isDefault ? COLORS.disabled : COLORS.coral }}
          activeOpacity={0.78}
          accessibilityRole="button"
          accessibilityLabel={`Delete ${room.name}`}
          accessibilityState={{ disabled: room.isDefault }}
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
        <View
          accessibilityRole="adjustable"
          accessibilityLabel={`Drag ${room.name}`}
          {...panResponder.panHandlers}
        >
          <Grip size={30} color={COLORS.disabled} />
        </View>
      </Animated.View>
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
