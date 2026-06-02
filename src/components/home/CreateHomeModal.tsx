import React from "react";
import { Modal, Pressable, Text, TextInput, View } from "react-native";
import { COLORS } from "@/constants/theme";

type CreateHomeModalProps = {
  visible: boolean;
  value: string;
  isPending?: boolean;
  onChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
};

export function CreateHomeModal({
  visible,
  value,
  isPending,
  onChange,
  onClose,
  onSubmit,
}: CreateHomeModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 justify-center bg-black/35 px-8" onPress={onClose}>
        <Pressable
          className="overflow-hidden rounded-[18px] bg-white"
          onPress={(event) => event.stopPropagation()}
        >
          <View className="px-7 pb-8 pt-7">
            <Text
              className="text-center text-[20px] font-extrabold"
              style={{ color: COLORS.text }}
            >
              Create Home
            </Text>
            <TextInput
              className="mt-8 border-b pb-3 text-[17px] font-semibold"
              style={{ borderColor: COLORS.line, color: COLORS.text }}
              value={value}
              autoFocus
              placeholder="Enter home name"
              placeholderTextColor={COLORS.disabled}
              onChangeText={onChange}
              returnKeyType="done"
              onSubmitEditing={onSubmit}
            />
          </View>
          <View className="h-px" style={{ backgroundColor: COLORS.line }} />
          <View className="h-[58px] flex-row">
            <Pressable className="flex-1 items-center justify-center" onPress={onClose}>
              <Text className="text-[16px] font-semibold" style={{ color: COLORS.muted }}>
                Cancel
              </Text>
            </Pressable>
            <View className="w-px" style={{ backgroundColor: COLORS.line }} />
            <Pressable
              className="flex-1 items-center justify-center"
              onPress={onSubmit}
              disabled={isPending}
            >
              <Text
                className="text-[16px] font-extrabold"
                style={{ color: COLORS.text }}
              >
                Finish
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
