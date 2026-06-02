import React from "react";
import { Pressable, Text, View } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { COLORS } from "@/constants/theme";

type MeMenuRowProps = {
  icon: React.ReactNode;
  title: string;
  onPress: () => void;
};

export function MeMenuRow({ icon, title, onPress }: MeMenuRowProps) {
  return (
    <Pressable
      className="flex-row items-center px-8 py-5"
      accessibilityRole="button"
      onPress={onPress}
    >
      <View className="mr-5 w-7 items-center">{icon}</View>
      <Text
        className="flex-1 text-[17px] font-normal leading-6"
        style={{ color: COLORS.text }}
      >
        {title}
      </Text>
      <ChevronRight size={22} color={COLORS.disabled} />
    </Pressable>
  );
}
