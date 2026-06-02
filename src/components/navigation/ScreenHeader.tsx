import React from "react";
import { Pressable, Text, View } from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { COLORS } from "@/constants/theme";

type ScreenHeaderProps = {
  title: string;
  onBack: () => void;
  right?: React.ReactNode;
};

export function ScreenHeader({ title, onBack, right }: ScreenHeaderProps) {
  return (
    <View className="h-[72px] flex-row items-center px-5">
      <Pressable
        className="h-[50px] w-[50px] items-center justify-center"
        accessibilityRole="button"
        onPress={onBack}
      >
        <ChevronLeft size={32} color={COLORS.text} strokeWidth={2.4} />
      </Pressable>
      <Text
        className="flex-1 text-center text-[24px] font-extrabold"
        style={{ color: COLORS.text }}
        numberOfLines={1}
      >
        {title}
      </Text>
      <View className="h-[50px] w-[50px] items-center justify-center">{right}</View>
    </View>
  );
}
