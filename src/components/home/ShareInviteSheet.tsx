import React from "react";
import { Modal, Pressable, Text, TouchableOpacity, View } from "react-native";
import { Copy, MessageCircle, MoreHorizontal, Smartphone } from "lucide-react-native";
import { COLORS } from "@/constants/theme";

type ShareInviteSheetProps = {
  visible: boolean;
  role: string;
  isSharing?: boolean;
  onClose: () => void;
  onShare: () => void | Promise<void>;
};

export function ShareInviteSheet({
  visible,
  role,
  isSharing,
  onClose,
  onShare,
}: ShareInviteSheetProps) {
  const options = [
    { label: "App\naccount", Icon: Smartphone },
    { label: "Messages", Icon: MessageCircle },
    { label: "Copy", Icon: Copy },
    { label: "More", Icon: MoreHorizontal },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/35">
        <Pressable className="flex-1" onPress={onClose} />
        <View className="mx-4 overflow-hidden rounded-[22px] bg-white">
          <View className="px-8 pb-8 pt-8">
            <Text
              className="text-center text-[20px] font-extrabold"
              style={{ color: COLORS.text }}
            >
              Share
            </Text>
            <View className="mt-8 flex-row justify-between">
              {options.map(({ label, Icon }) => (
                <TouchableOpacity
                  key={label}
                  className="items-center"
                  activeOpacity={0.78}
                  onPress={onShare}
                  disabled={isSharing}
                >
                  <View className="h-[66px] w-[66px] items-center justify-center rounded-[18px] bg-[#F3F3F3]">
                    <Icon size={28} color={COLORS.text} />
                  </View>
                  <Text
                    className="mt-3 text-center text-[15px] leading-5"
                    style={{ color: COLORS.muted }}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View className="mt-8 flex-row items-center">
              <Text className="text-[17px]" style={{ color: COLORS.muted }}>
                Role:
              </Text>
              <Text className="text-[17px]" style={{ color: COLORS.coral }}>
                {role}
              </Text>
            </View>
          </View>
          <View className="h-px" style={{ backgroundColor: COLORS.line }} />
          <Pressable
            className="h-[64px] items-center justify-center"
            accessibilityRole="button"
            onPress={onClose}
          >
            <Text
              className="text-[19px] font-extrabold"
              style={{ color: COLORS.text }}
            >
              Cancel
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
