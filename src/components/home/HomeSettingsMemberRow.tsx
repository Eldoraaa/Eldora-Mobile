import React from "react";
import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { HomeMemberAvatar } from "@/components/home/HomeMemberAvatar";
import { COLORS } from "@/constants/theme";
import { HomeMember } from "@/types/home.types";

type HomeSettingsMemberRowProps = {
  homeId: string;
  member: HomeMember;
};

export function HomeSettingsMemberRow({
  homeId,
  member,
}: HomeSettingsMemberRowProps) {
  return (
    <Pressable
      className="flex-row items-center px-8 py-4"
      accessibilityRole="button"
      onPress={() =>
        router.push({
          pathname: "/home-member",
          params: { homeId, memberId: member.id },
        } as never)
      }
    >
      <HomeMemberAvatar avatarUrl={member.avatarUrl} name={member.name} />
      <View className="ml-5 flex-1">
        <Text
          className="text-[15px] font-semibold leading-5"
          style={{ color: COLORS.text }}
          numberOfLines={1}
        >
          {member.name}
        </Text>
        <Text
          className="mt-1 text-[12px] font-semibold leading-4"
          style={{ color: COLORS.muted }}
          numberOfLines={1}
        >
          {member.email}
        </Text>
      </View>
      <Text
        className="max-w-[104px] text-right text-[12px] font-semibold leading-4"
        style={{ color: COLORS.muted }}
        numberOfLines={2}
      >
        {member.role}
      </Text>
      <ChevronRight size={22} color={COLORS.disabled} />
    </Pressable>
  );
}
