import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { Home, Settings } from "lucide-react-native";
import { MainTabScreen } from "@/components/navigation/MainTabScreen";
import { MeMenuRow } from "@/components/settings/MeMenuRow";
import { useAuthStore } from "@/stores/authStore";
import { COLORS } from "@/constants/theme";

export default function SettingsScreen() {
  const { user } = useAuthStore();
  const displayName = user?.name || user?.email?.split("@")[0] || "Caregiver";
  const emailLabel = user?.email ?? "No email connected";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <MainTabScreen active="me">
      <View className="flex-1 bg-white">
        <View className="h-[68px] flex-row items-center border-b border-[#F1F1F1] px-5">
          <View className="h-11 w-11" />
          <View className="flex-1" />
          <Pressable
            className="h-11 w-11 items-center justify-center"
            accessibilityRole="button"
            accessibilityLabel="Open settings"
            onPress={() => router.push("/account" as never)}
          >
            <Settings size={27} color={COLORS.text} strokeWidth={2.35} />
          </Pressable>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerClassName="pb-10"
          showsVerticalScrollIndicator={false}
        >
          <View className="px-8 pt-8">
            <View className="flex-row items-center">
              <View className="h-[68px] w-[68px] items-center justify-center rounded-full bg-eldora-coral">
                <Text className="text-[24px] font-extrabold text-white">
                  {initial}
                </Text>
              </View>
              <View className="ml-5 flex-1">
                <Text
                  className="text-[18px] font-extrabold leading-6"
                  style={{ color: COLORS.text }}
                  numberOfLines={1}
                >
                  {displayName}
                </Text>
                <Text className="mt-1 text-[14px] font-semibold text-[#5F6B7A]">
                  {emailLabel}
                </Text>
              </View>
            </View>
          </View>

          <View className="mt-10">
            <MeMenuRow
              icon={<Home size={23} color={COLORS.text} />}
              title="Home Management"
              onPress={() => router.push("/home-management" as never)}
            />
          </View>
        </ScrollView>
      </View>
    </MainTabScreen>
  );
}
