import React from "react";
import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { COLORS } from "@/constants/theme";
import { HomeListItem } from "@/types/home.types";

type HomeManagementRowProps = {
  home: HomeListItem;
};

export function HomeManagementRow({ home }: HomeManagementRowProps) {
  return (
    <Pressable
      className="flex-row items-center px-8 py-6"
      accessibilityRole="button"
      onPress={() =>
        router.push({
          pathname: "/home-settings",
          params: { homeId: home.id },
        } as never)
      }
    >
      <View className="flex-1">
        <Text
          className="text-[17px] font-semibold leading-6"
          style={{ color: COLORS.text }}
          numberOfLines={1}
        >
          {home.name}
        </Text>
        <Text
          className="mt-1 text-[14px] leading-5"
          style={{ color: COLORS.muted }}
          numberOfLines={1}
        >
          {home.memberCount} member(s) - {home.roomCount} room(s)
        </Text>
      </View>
      <ChevronRight size={22} color={COLORS.disabled} />
    </Pressable>
  );
}
