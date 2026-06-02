import React from "react";
import { Modal, Pressable, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { Check, SlidersHorizontal } from "lucide-react-native";
import { COLORS } from "@/constants/theme";

type HomeSelectorMenuProps = {
  visible: boolean;
  selectedHomeName?: string;
  hasSelectedHome?: boolean;
  onClose: () => void;
};

export function HomeSelectorMenu({
  visible,
  selectedHomeName,
  hasSelectedHome = Boolean(selectedHomeName),
  onClose,
}: HomeSelectorMenuProps) {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 bg-black/45" onPress={onClose}>
        <View className="mx-auto w-full max-w-[430px]">
          <Pressable
            className="rounded-b-[18px] bg-white px-6 pb-4 pt-12"
            onPress={(event) => event.stopPropagation()}
          >
            {hasSelectedHome ? (
              <>
                <TouchableOpacity
                  className="h-14 flex-row items-center"
                  activeOpacity={0.78}
                  onPress={onClose}
                >
                  <Check size={20} color={COLORS.coral} />
                  <Text
                    className="ml-5 text-[17px] font-normal"
                    style={{ color: COLORS.text }}
                  >
                    {selectedHomeName}
                  </Text>
                </TouchableOpacity>
                <View className="h-px bg-[#F1F1F1]" />
              </>
            ) : null}
            <TouchableOpacity
              className="h-14 flex-row items-center"
              activeOpacity={0.78}
              onPress={() => {
                onClose();
                router.push("/home-management" as never);
              }}
            >
              <SlidersHorizontal size={20} color={COLORS.text} />
              <Text
                className="ml-5 text-[17px] font-normal"
                style={{ color: COLORS.text }}
              >
                Home Management
              </Text>
            </TouchableOpacity>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}
