import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { CheckSquare, Router as RouterIcon } from "lucide-react-native";
import { COLORS } from "@/constants/theme";

type AddDeviceMenuProps = {
  visible: boolean;
  top?: number;
  showCreateScene?: boolean;
  onClose: () => void;
};

export function AddDeviceMenu({
  visible,
  top = 68,
  showCreateScene = false,
  onClose,
}: AddDeviceMenuProps) {
  if (!visible) return null;

  return (
    <View
      className="absolute right-5 z-10 w-[220px] rounded-[18px] bg-white py-2"
      style={{
        top,
        shadowColor: COLORS.text,
        shadowOpacity: 0.14,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 8 },
        elevation: 8,
      }}
    >
      <TouchableOpacity
        onPress={() => {
          onClose();
          router.push("/add-device" as never);
        }}
        className="flex-row items-center gap-4 px-5 py-3.5"
        activeOpacity={0.78}
      >
        <RouterIcon size={22} color={COLORS.text} />
        <Text
          className="text-[16px] font-extrabold"
          style={{ color: COLORS.text }}
        >
          Add Device
        </Text>
      </TouchableOpacity>
      {showCreateScene ? (
        <>
          <View className="ml-[64px] h-px" style={{ backgroundColor: COLORS.line }} />
          <TouchableOpacity
            onPress={() => {
              onClose();
              router.push("/create-scene" as never);
            }}
            className="flex-row items-center gap-4 px-5 py-3.5"
            activeOpacity={0.78}
          >
            <CheckSquare size={22} color={COLORS.text} />
            <Text
              className="text-[16px] font-extrabold"
              style={{ color: COLORS.text }}
            >
              Create Scene
            </Text>
          </TouchableOpacity>
        </>
      ) : null}
    </View>
  );
}
