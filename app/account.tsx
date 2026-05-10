import React, { useEffect } from "react";
import { BackHandler, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ArrowLeft, Fingerprint, Mail } from "lucide-react-native";
import { useAuthStore } from "@/stores/authStore";

const TEXT_COLOR = "#171819";

function backToSettings() {
  router.replace("/settings" as never);
}

function SectionHeader({ title }: { title: string }) {
  return (
    <View className="h-[38px] justify-center bg-[#F6F6F6] px-6">
      <Text className="text-[15px] font-bold leading-5 text-[#9A9A9A]">
        {title}
      </Text>
    </View>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <View className="min-h-[74px] flex-row items-center border-b border-[#EFEFEF] bg-white px-6">
      <View className="mr-4 w-8 items-center">{icon}</View>
      <View className="flex-1">
        <Text className="text-[13px] font-semibold leading-5 text-[#777873]">
          {label}
        </Text>
        <Text
          className="text-[15px] font-bold leading-6 text-[#171819]"
          numberOfLines={2}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

export default function AccountScreen() {
  const { user } = useAuthStore();
  const displayName = user?.name || user?.email?.split("@")[0] || "Caregiver";
  const initial = displayName.charAt(0).toUpperCase();

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        backToSettings();
        return true;
      }
    );

    return () => subscription.remove();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-[#F6F6F6]">
      <View className="mx-auto w-full max-w-[430px] flex-1 bg-[#F6F6F6]">
        <View className="h-[88px] flex-row items-center border-b border-[#EFEFEF] bg-white px-6 pt-8">
          <TouchableOpacity
            onPress={backToSettings}
            className="mr-4 h-10 w-10 items-center justify-center"
            activeOpacity={0.72}
            accessibilityLabel="Back to settings"
          >
            <ArrowLeft size={26} color={TEXT_COLOR} />
          </TouchableOpacity>
          <Text className="text-[20px] font-bold leading-7 text-[#171819]">
            Account
          </Text>
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <SectionHeader title="Profile" />
          <View className="min-h-[104px] flex-row items-center border-b border-[#EFEFEF] bg-white px-6">
            <View className="mr-4 h-16 w-16 items-center justify-center rounded-full bg-[#EAF5FB]">
              <Text className="text-[24px] font-bold text-[#171819]">
                {initial}
              </Text>
            </View>
            <View className="flex-1">
              <Text
                className="text-[18px] font-bold leading-6 text-[#171819]"
                numberOfLines={2}
              >
                {displayName}
              </Text>
              <Text className="mt-1 text-[13px] font-semibold leading-5 text-[#777873]">
                Eldora account
              </Text>
            </View>
          </View>

          <SectionHeader title="Account details" />
          <DetailRow
            icon={<Mail size={22} color={TEXT_COLOR} />}
            label="Email Address"
            value={user?.email ?? "No email address"}
          />
          <DetailRow
            icon={<Fingerprint size={22} color={TEXT_COLOR} />}
            label="User ID"
            value={user?.id ?? "Not available"}
          />

          <View className="min-h-12 flex-1 bg-[#F6F6F6]" />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
