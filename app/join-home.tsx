import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ArrowRight, ChevronLeft, HousePlus } from "lucide-react-native";
import { COLORS } from "@/constants/theme";
import { useBackNavigation } from "@/hooks/useBackNavigation";
import { useJoinHomeMutation } from "@/hooks/useHomeManagementQueries";
import { useHomeStore } from "@/stores/homeStore";

export default function JoinHomeScreen() {
  const goBack = useBackNavigation("/home-management");
  const joinHomeMutation = useJoinHomeMutation();
  const setSelectedHomeId = useHomeStore((state) => state.setSelectedHomeId);
  const [inviteCode, setInviteCode] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const normalizedCode = inviteCode.trim().toUpperCase();
  const canSubmit = normalizedCode.length >= 4 && !joinHomeMutation.isPending;

  const joinHome = async () => {
    if (!canSubmit) return;

    try {
      const home = await joinHomeMutation.mutateAsync({
        inviteCode: normalizedCode,
      });
      setSelectedHomeId(home.id);
      Toast.show({
        type: "success",
        text1: "Home joined",
        text2: `${home.name} is now available.`,
      });
      router.replace("/home" as never);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Could not join home",
        text2: error.response?.data?.message ?? "Check the invitation code.",
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="mx-auto w-full max-w-[430px] flex-1 bg-white"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View className="h-[72px] flex-row items-center px-5">
          <Pressable
            className="h-11 w-11 items-center justify-center"
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={goBack}
          >
            <ChevronLeft size={30} color={COLORS.text} strokeWidth={2.4} />
          </Pressable>
          <Text
            className="flex-1 pr-11 text-center text-[22px] font-extrabold"
            style={{ color: COLORS.text }}
          >
            Join a home
          </Text>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerClassName="flex-grow px-8 pb-10 pt-14"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="items-center">
            <View className="h-[76px] w-[76px] items-center justify-center rounded-[24px] bg-[#FFE7E2]">
              <HousePlus size={43} color={COLORS.coral} strokeWidth={2.4} />
            </View>

            <Text
              className="mt-6 max-w-[315px] text-center text-[17px] font-normal leading-[23px]"
              style={{ color: COLORS.muted }}
            >
              Please contact the administrator to get an invitation (Home
              Settings &gt; Add Member)
            </Text>
          </View>

          <View className="mt-9">
            <Text className="mb-2 text-[13px] font-bold" style={{ color: COLORS.text }}>
              Invitation code
            </Text>
            <View
              className="h-14 flex-row items-center rounded-2xl border bg-white px-4"
              style={{
                borderColor: isFocused ? COLORS.coral : COLORS.line,
              }}
            >
              <TextInput
                className="h-full flex-1 py-0 pr-3 text-[15px] font-semibold"
                style={{ color: COLORS.text }}
                value={inviteCode}
                autoCapitalize="characters"
                autoCorrect={false}
                placeholder="Enter invitation code"
                placeholderTextColor="#6F7A87"
                returnKeyType="go"
                accessibilityLabel="Invitation code"
                accessibilityHint="Enter the shared home invitation code"
                selectionColor={COLORS.coral}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onChangeText={setInviteCode}
                onSubmitEditing={joinHome}
              />
              <Pressable
                className="h-10 w-10 items-center justify-center"
                accessibilityRole="button"
                accessibilityLabel="Join home"
                accessibilityState={{ disabled: !canSubmit, busy: joinHomeMutation.isPending }}
                disabled={!canSubmit}
                onPress={joinHome}
              >
                {joinHomeMutation.isPending ? (
                  <ActivityIndicator color={COLORS.coral} />
                ) : (
                  <ArrowRight
                    size={22}
                    color={canSubmit ? COLORS.coral : COLORS.disabled}
                    strokeWidth={2.5}
                  />
                )}
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
