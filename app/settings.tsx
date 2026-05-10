import React, { useEffect, useState } from "react";
import { BackHandler, Modal, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { LogOut, UserRound, X } from "lucide-react-native";
import { useAuthStore } from "@/stores/authStore";
import { queryClient } from "@/lib/queryClient";

const TEXT_COLOR = "#171819";

function closeSettings() {
  router.replace("/home" as never);
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

function SettingRow({
  icon,
  title,
  tone = "default",
  onPress,
}: {
  icon: React.ReactNode;
  title: string;
  tone?: "default" | "danger";
  onPress: () => void;
}) {
  const color = tone === "danger" ? "#EF4444" : TEXT_COLOR;

  return (
    <Pressable
      className="min-h-[64px] flex-row items-center border-b border-[#EFEFEF] bg-white px-6"
      accessibilityRole="button"
      onPress={onPress}
    >
      <View className="mr-4 w-8 items-center">{icon}</View>
      <Text
        className="flex-1 text-[16px] font-bold leading-6"
        style={{ color }}
      >
        {title}
      </Text>
    </Pressable>
  );
}

export default function SettingsScreen() {
  const { logout } = useAuthStore();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        closeSettings();
        return true;
      }
    );

    return () => subscription.remove();
  }, []);

  const handleLogout = () => {
    setShowLogoutModal(false);
    queryClient.clear();
    logout();
    router.replace("/welcome" as never);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F6F6F6]">
      <View className="mx-auto w-full max-w-[430px] flex-1 bg-[#F6F6F6]">
        <View className="h-[88px] flex-row items-center border-b border-[#EFEFEF] bg-white px-6 pt-8">
          <Pressable
            className="mr-4 h-10 w-10 items-center justify-center"
            accessibilityRole="button"
            accessibilityLabel="Close settings"
            onPress={closeSettings}
          >
            <X size={28} color={TEXT_COLOR} />
          </Pressable>
          <Text className="text-[20px] font-bold leading-7 text-[#171819]">
            Settings
          </Text>
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <SectionHeader title="Account" />
          <SettingRow
            icon={<UserRound size={22} color={TEXT_COLOR} />}
            title="Account"
            onPress={() => router.push("/account" as never)}
          />
          <SettingRow
            icon={<LogOut size={22} color="#EF4444" />}
            title="Logout"
            tone="danger"
            onPress={() => setShowLogoutModal(true)}
          />

          <View className="min-h-12 flex-1 bg-[#F6F6F6]" />
        </ScrollView>
      </View>

      <LogoutModal
        visible={showLogoutModal}
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
    </SafeAreaView>
  );
}

function LogoutModal({
  visible,
  onCancel,
  onConfirm,
}: {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View className="flex-1 justify-end bg-black/45">
        <Pressable className="flex-1" onPress={onCancel} />
        <View className="rounded-t-[26px] bg-white px-6 pb-9 pt-7">
          <View className="h-[52px] w-[52px] items-center justify-center rounded-full bg-[#EAF5FB]">
            <LogOut size={24} color={TEXT_COLOR} />
          </View>
          <Text className="mt-5 text-[22px] font-bold leading-7 text-[#171819]">
            Logout from Eldora?
          </Text>
          <Text className="mt-3 text-[14px] leading-6 text-[#6F7173]">
            You can sign back in anytime with your account.
          </Text>
          <Pressable
            className="mt-7 h-[52px] items-center justify-center rounded-full bg-[#171819]"
            accessibilityRole="button"
            onPress={onConfirm}
          >
            <Text className="text-[14px] font-bold leading-5 text-white">
              Logout
            </Text>
          </Pressable>
          <Pressable
            className="mt-3 h-[48px] items-center justify-center"
            accessibilityRole="button"
            onPress={onCancel}
          >
            <Text className="text-[14px] font-bold leading-5 text-[#171819]">
              Cancel
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
