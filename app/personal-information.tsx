import React, { useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ScreenHeader } from "@/components/navigation/ScreenHeader";
import { AccountSecurityRow } from "@/components/settings/AccountSecurityRow";
import { COLORS } from "@/constants/theme";
import { useBackNavigation } from "@/hooks/useBackNavigation";
import { queryClient } from "@/lib/queryClient";
import { useAuthStore } from "@/stores/authStore";
import { userCode } from "@/utils/user.utils";

export default function PersonalInformationScreen() {
  const goBack = useBackNavigation("/account");
  const { logout, user } = useAuthStore();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const displayName = user?.name || user?.email?.split("@")[0] || "Caregiver";

  const handleLogout = () => {
    setShowLogoutModal(false);
    queryClient.clear();
    logout();
    router.replace("/welcome" as never);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="mx-auto w-full max-w-[430px] flex-1 bg-white">
        <ScreenHeader title="Personal Information" onBack={goBack} />

        <ScrollView
          className="flex-1 bg-white"
          contentContainerClassName="pb-12 pt-8"
          showsVerticalScrollIndicator={false}
        >
          <AccountSecurityRow
            title="Full Name"
            subtitle={displayName}
            showChevron={false}
          />
          <AccountSecurityRow
            title="Email Address"
            subtitle={user?.email ?? "No email connected"}
            showChevron={false}
          />
          <AccountSecurityRow
            title="Account ID"
            value={userCode(user?.id)}
            showChevron={false}
          />

          <View className="mt-10">
            <AccountSecurityRow
              title="Logout"
              destructive
              onPress={() => setShowLogoutModal(true)}
              showChevron={false}
            />
          </View>
        </ScrollView>

        <LogoutModal
          visible={showLogoutModal}
          onCancel={() => setShowLogoutModal(false)}
          onConfirm={handleLogout}
        />
      </View>
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
      <View className="flex-1 justify-end bg-black/35">
        <Pressable className="flex-1" onPress={onCancel} />
        <View className="rounded-t-[24px] bg-white px-6 pb-9 pt-7">
          <Text
            className="text-[20px] font-extrabold leading-7"
            style={{ color: COLORS.text }}
          >
            Logout from Eldora?
          </Text>
          <Text
            className="mt-3 text-[14px] leading-6"
            style={{ color: COLORS.muted }}
          >
            You can sign in again anytime.
          </Text>
          <Pressable
            className="mt-7 h-[52px] items-center justify-center rounded-[16px]"
            style={{ backgroundColor: COLORS.coral }}
            accessibilityRole="button"
            onPress={onConfirm}
          >
            <Text className="text-[15px] font-bold leading-5 text-white">
              Logout
            </Text>
          </Pressable>
          <Pressable
            className="mt-3 h-[48px] items-center justify-center"
            accessibilityRole="button"
            onPress={onCancel}
          >
            <Text
              className="text-[15px] font-bold leading-5"
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
