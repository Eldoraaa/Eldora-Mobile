import React from "react";
import {
  ActivityIndicator,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "@/constants/theme";

type AddRoomModalProps = {
  visible: boolean;
  roomName: string;
  isPending?: boolean;
  onChangeRoomName: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
};

export function AddRoomModal({
  visible,
  roomName,
  isPending,
  onChangeRoomName,
  onClose,
  onSubmit,
}: AddRoomModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 justify-center bg-black/25 px-8">
        <View className="overflow-hidden rounded-[20px] bg-white">
          <View className="px-7 pb-8 pt-8">
            <Text
              className="text-center text-[20px] font-extrabold"
              style={{ color: COLORS.text }}
            >
              Add Room
            </Text>
            <TextInput
              value={roomName}
              onChangeText={onChangeRoomName}
              placeholder="Enter room name"
              placeholderTextColor={COLORS.disabled}
              autoFocus
              className="mt-8 h-14 text-[17px] font-semibold"
              style={{ color: COLORS.text }}
              returnKeyType="done"
              onSubmitEditing={onSubmit}
            />
          </View>
          <View className="h-px" style={{ backgroundColor: COLORS.line }} />
          <View className="h-16 flex-row">
            <TouchableOpacity
              className="flex-1 items-center justify-center"
              activeOpacity={0.78}
              onPress={onClose}
            >
              <Text
                className="text-[16px] font-semibold"
                style={{ color: COLORS.muted }}
              >
                Cancel
              </Text>
            </TouchableOpacity>
            <View className="w-px" style={{ backgroundColor: COLORS.line }} />
            <TouchableOpacity
              className="flex-1 items-center justify-center"
              activeOpacity={0.78}
              onPress={onSubmit}
              disabled={isPending}
            >
              {isPending ? (
                <ActivityIndicator color={COLORS.coral} />
              ) : (
                <Text
                  className="text-[16px] font-extrabold"
                  style={{ color: COLORS.text }}
                >
                  Finish
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
