import React, { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ArrowLeft, Fingerprint, LogOut, Mail } from "lucide-react-native";
import { useAuthStore } from "@/stores/authStore";
import { queryClient } from "@/lib/queryClient";
import { useBackNavigation } from "@/hooks/useBackNavigation";
import { COLORS } from "@/constants/theme";

function SectionHeader({ title }: { title: string }) {
  return (
    <View
      className="h-[38px] justify-center px-6"
      style={{ backgroundColor: COLORS.surfaceMuted }}
    >
      <Text
        className="text-[14px] font-bold leading-5"
        style={{ color: COLORS.muted }}
      >
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
    <View
      className="min-h-[74px] flex-row items-center border-b bg-white px-6"
      style={{ borderColor: COLORS.line }}
    >
      <View className="mr-4 w-8 items-center">{icon}</View>
      <View className="flex-1">
        <Text
          className="text-[13px] font-semibold leading-5"
          style={{ color: COLORS.muted }}
        >
          {label}
        </Text>
        <Text
          className="text-[15px] font-bold leading-6"
          style={{ color: COLORS.text }}
          numberOfLines={2}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

export default function AccountScreen() {
  const goBack = useBackNavigation("/account");
  const { logout, user } = useAuthStore();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const displayName = user?.name || user?.email?.split("@")[0] || "Caregiver";
  const initial = displayName.charAt(0).toUpperCase();

  const handleLogout = () => {
    setShowLogoutModal(false);
    queryClient.clear();
    logout();
    router.replace("/welcome" as never);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="mx-auto w-full max-w-[430px] flex-1 bg-white">
        <View className="h-[88px] flex-row items-center border-b border-eldora-line bg-white px-6 pt-8">
          <TouchableOpacity
            onPress={goBack}
            className="mr-4 h-10 w-10 items-center justify-center"
            activeOpacity={0.72}
            accessibilityLabel="Back to settings"
          >
            <ArrowLeft size={26} color={COLORS.text} />
          </TouchableOpacity>
          <Text
            className="text-[18px] font-extrabold leading-6"
            style={{ color: COLORS.text }}
          >
            Personal Information
          </Text>
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <SectionHeader title="Profile" />
          <View
            className="min-h-[104px] flex-row items-center border-b bg-white px-6"
            style={{ borderColor: COLORS.line }}
          >
            <View
              className="mr-4 h-16 w-16 items-center justify-center rounded-full"
              style={{ backgroundColor: COLORS.coralSoft }}
            >
              {user?.avatarUrl ? (
                <Image
                  source={{ uri: user.avatarUrl }}
                  className="h-16 w-16 rounded-full"
                />
              ) : (
                <Text
                  className="text-[22px] font-extrabold"
                  style={{ color: COLORS.text }}
                >
                  {initial}
                </Text>
              )}
            </View>
            <View className="flex-1">
              <Text
                className="text-[17px] font-extrabold leading-6"
                style={{ color: COLORS.text }}
                numberOfLines={2}
              >
                {displayName}
              </Text>
              <Text
                className="mt-1 text-[13px] font-semibold leading-5"
                style={{ color: COLORS.muted }}
              >
                Caregiver account
              </Text>
            </View>
          </View>

          <SectionHeader title="Caregiver details" />
          <DetailRow
            icon={<Mail size={22} color={COLORS.text} />}
            label="Email Address"
            value={user?.email ?? "No email address"}
          />
          <DetailRow
            icon={<Fingerprint size={22} color={COLORS.text} />}
            label="User ID"
            value={user?.id ?? "Not available"}
          />

          <TouchableOpacity
            className="mt-8 mx-6 h-[52px] flex-row items-center justify-center rounded-[16px]"
            style={{ backgroundColor: COLORS.coralSoft }}
            activeOpacity={0.82}
            onPress={() => setShowLogoutModal(true)}
          >
            <LogOut size={20} color={COLORS.coral} />
            <Text
              className="ml-2 text-[15px] font-extrabold"
              style={{ color: COLORS.coral }}
            >
              Logout
            </Text>
          </TouchableOpacity>

          <View className="min-h-12 flex-1 bg-white" />
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
