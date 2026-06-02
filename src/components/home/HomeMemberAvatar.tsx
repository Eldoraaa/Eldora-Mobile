import React from "react";
import { Image, Text, View } from "react-native";
import { Router } from "lucide-react-native";
import { COLORS } from "@/constants/theme";

type HomeMemberAvatarProps = {
  size?: number;
  avatarUrl?: string | null;
  name?: string | null;
};

export function HomeMemberAvatar({
  size = 50,
  avatarUrl,
  name,
}: HomeMemberAvatarProps) {
  const inner = Math.max(size - 12, 28);
  const initial = (name?.trim()?.charAt(0) || "E").toUpperCase();

  return (
    <View
      className="items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
        backgroundColor: COLORS.coral,
      }}
    >
      {avatarUrl ? (
        <Image
          source={{ uri: avatarUrl }}
          className="rounded-full"
          style={{ width: size, height: size }}
        />
      ) : (
      <View
        className="items-center justify-center rounded-full bg-white"
        style={{ width: inner, height: inner }}
      >
        {name ? (
          <Text
            className="text-[18px] font-extrabold"
            style={{ color: COLORS.text, fontSize: Math.round(inner * 0.42) }}
          >
            {initial}
          </Text>
        ) : (
          <>
            <Router size={Math.round(inner * 0.48)} color={COLORS.text} />
            <Text
              className="absolute bottom-1 text-[7px] font-extrabold"
              style={{ color: COLORS.coral }}
            >
              E
            </Text>
          </>
        )}
      </View>
      )}
    </View>
  );
}
