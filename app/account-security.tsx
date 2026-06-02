import React, { useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import { ScreenHeader } from "@/components/navigation/ScreenHeader";
import { AccountSecurityRow } from "@/components/settings/AccountSecurityRow";
import { COLORS } from "@/constants/theme";
import { useBackNavigation } from "@/hooks/useBackNavigation";
import { queryClient } from "@/lib/queryClient";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/stores/authStore";
import { userCode } from "@/utils/user.utils";

function getErrorMessage(error: unknown): string {
  const responseMessage = (error as { response?: { data?: { message?: unknown } } })
    ?.response?.data?.message;
  if (typeof responseMessage === "string") return responseMessage;
  if (error instanceof Error && error.message) return error.message;
  return "Delete account failed. Please try again.";
}

export default function AccountSecurityScreen() {
  const goBack = useBackNavigation("/account");
  const { logout, user } = useAuthStore();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      await authService.deleteAccount();
      queryClient.clear();
      logout();
      setShowDeleteModal(false);
      router.replace("/welcome" as never);
      Toast.show({
        type: "success",
        text1: "Account deleted",
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Delete account failed",
        text2: getErrorMessage(error),
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="mx-auto w-full max-w-[430px] flex-1 bg-white">
        <ScreenHeader title="Account and Security" onBack={goBack} />

        <ScrollView
          className="flex-1 bg-white"
          contentContainerClassName="pb-12 pt-8"
          showsVerticalScrollIndicator={false}
        >
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
              title="Delete Account"
              destructive
              onPress={() => setShowDeleteModal(true)}
              showChevron={false}
            />
          </View>
        </ScrollView>

        <DeleteAccountModal
          visible={showDeleteModal}
          isDeleting={isDeleting}
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteAccount}
        />
      </View>
    </SafeAreaView>
  );
}

function DeleteAccountModal({
  visible,
  isDeleting,
  onCancel,
  onConfirm,
}: {
  visible: boolean;
  isDeleting: boolean;
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
            Delete this account?
          </Text>
          <Text
            className="mt-3 text-[14px] leading-6"
            style={{ color: COLORS.muted }}
          >
            Your account access will be removed from Eldora. This action cannot
            be undone.
          </Text>
          <Pressable
            className="mt-7 h-[52px] items-center justify-center rounded-[16px]"
            style={{ backgroundColor: COLORS.coral }}
            accessibilityRole="button"
            disabled={isDeleting}
            onPress={onConfirm}
          >
            <Text className="text-[15px] font-bold leading-5 text-white">
              {isDeleting ? "Deleting..." : "Delete Account"}
            </Text>
          </Pressable>
          <Pressable
            className="mt-3 h-[48px] items-center justify-center"
            accessibilityRole="button"
            disabled={isDeleting}
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
