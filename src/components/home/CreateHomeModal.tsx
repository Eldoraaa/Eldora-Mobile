import React from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, Text, TextInput, View } from "react-native";
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
    <Modal visible={visible} transparent animationType="fade" accessibilityViewIsModal onRequestClose={onClose}>
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <Pressable className="flex-1 justify-center bg-black/35 px-8" onPress={onClose}>
          <Pressable
            className="overflow-hidden rounded-[20px] bg-white"
            accessibilityRole="summary"
            accessibilityLabel="Create home form"
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
              accessibilityLabel="Home name"
              returnKeyType="done"
              onSubmitEditing={onSubmit}
            />
          </View>
          <View className="h-px" style={{ backgroundColor: COLORS.line }} />
          <View className="h-[58px] flex-row">
            <Pressable className="flex-1 items-center justify-center" accessibilityRole="button" accessibilityLabel="Cancel create home" onPress={onClose}>
              <Text className="text-[16px] font-semibold" style={{ color: COLORS.muted }}>
                Cancel
              </Text>
            </Pressable>
            <View className="w-px" style={{ backgroundColor: COLORS.line }} />
            <Pressable
              className="flex-1 items-center justify-center"
              onPress={onSubmit}
              disabled={isPending}
              accessibilityRole="button"
              accessibilityLabel="Create home"
              accessibilityState={{ disabled: Boolean(isPending), busy: Boolean(isPending) }}
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
      </KeyboardAvoidingView>
    </Modal>
  );
}
