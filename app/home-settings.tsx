import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Share,
  Text,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { EditHomeNameModal } from "@/components/home/EditHomeNameModal";
import { HomeSettingsMemberRow } from "@/components/home/HomeSettingsMemberRow";
import { HomeSettingsRow } from "@/components/home/HomeSettingsRow";
import { ShareInviteSheet } from "@/components/home/ShareInviteSheet";
import { COLORS } from "@/constants/theme";
import { useBackNavigation } from "@/hooks/useBackNavigation";
import {
  useCreateHomeInvitationMutation,
  useHomeSettingsQuery,
  useHomesQuery,
  useUpdateHomeMutation,
} from "@/hooks/useHomeManagementQueries";

export default function HomeSettingsScreen() {
  const goBack = useBackNavigation("/home-management");
  const params = useLocalSearchParams<{ homeId?: string }>();
  const homesQuery = useHomesQuery();
  const fallbackHomeId = homesQuery.data?.[0]?.id;
  const homeId = params.homeId ?? fallbackHomeId ?? null;
  const settingsQuery = useHomeSettingsQuery(homeId);
  const updateHomeMutation = useUpdateHomeMutation(homeId);
  const createInvitationMutation = useCreateHomeInvitationMutation(homeId);
  const home = settingsQuery.data;
  const [draftHomeName, setDraftHomeName] = useState("");
  const [showNameModal, setShowNameModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    if (home?.name) setDraftHomeName(home.name);
  }, [home?.name]);

  const inviteMessage = useMemo(
    () =>
      `Join ${home?.name ?? "Eldora Home"} on Eldora. Open Join a home and enter this invitation code:`,
    [home?.name]
  );

  const shareInvite = async () => {
    if (!homeId) return;

    try {
      const invitation = await createInvitationMutation.mutateAsync({
        role: "common_member",
      });
      await Share.share({
        message: `${inviteMessage} ${invitation.inviteCode}`,
      });
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Could not create invite",
        text2: error.response?.data?.message ?? "Please try again.",
      });
    }
  };

  const saveHomeName = async () => {
    const name = draftHomeName.trim();
    if (!name || !homeId) return;

    try {
      await updateHomeMutation.mutateAsync({ name });
      setShowNameModal(false);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Could not update home",
        text2: error.response?.data?.message ?? "Please try again.",
      });
    }
  };

  const isLoading = settingsQuery.isLoading || homesQuery.isLoading;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="mx-auto w-full max-w-[430px] flex-1 bg-white">
        <View className="h-[72px] flex-row items-center px-5">
          <Pressable
            className="h-11 w-11 items-center justify-center"
            accessibilityRole="button"
            onPress={goBack}
          >
            <ChevronLeft size={30} color={COLORS.text} strokeWidth={2.4} />
          </Pressable>
          <Text
            className="flex-1 pr-11 text-center text-[22px] font-extrabold leading-7"
            style={{ color: COLORS.text }}
          >
            Home Settings
          </Text>
        </View>

        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={COLORS.coral} />
          </View>
        ) : (
          <ScrollView
            className="flex-1 bg-white"
            contentContainerClassName="pb-12 pt-8"
            showsVerticalScrollIndicator={false}
          >
            <HomeSettingsRow
              label="Home Name"
              value={home?.name ?? "Eldora Home"}
              onPress={() => setShowNameModal(true)}
            />
            <HomeSettingsRow
              label="Room Management"
              value={`${home?.roomCount ?? 0} Room(s)`}
              onPress={() =>
                router.push({
                  pathname: "/room-management",
                  params: homeId ? { homeId } : undefined,
                } as never)
              }
            />
            <HomeSettingsRow
              label="Location"
              value={home?.locationLabel ?? "Set location"}
              onPress={() =>
                router.push({
                  pathname: "/home-location",
                  params: homeId ? { homeId } : undefined,
                } as never)
              }
            />

            <Text
              className="mt-7 px-8 text-[14px] font-semibold leading-5"
              style={{ color: COLORS.muted }}
            >
              Home Member
            </Text>
            <View className="mt-5">
              {(home?.members ?? []).map((member) => (
                <HomeSettingsMemberRow
                  key={member.id}
                  homeId={home!.id}
                  member={member}
                />
              ))}
            </View>

            <Pressable
              className="mt-5 px-8 py-5"
              accessibilityRole="button"
              onPress={() => setShowShareModal(true)}
            >
              <Text
                className="text-[16px] font-extrabold leading-6"
                style={{ color: COLORS.coral }}
              >
                Add Member
              </Text>
            </Pressable>
          </ScrollView>
        )}

        <EditHomeNameModal
          visible={showNameModal}
          value={draftHomeName}
          isPending={updateHomeMutation.isPending}
          onChange={setDraftHomeName}
          onSave={saveHomeName}
          onClose={() => setShowNameModal(false)}
        />

        <ShareInviteSheet
          visible={showShareModal}
          role="Common Member"
          onClose={() => setShowShareModal(false)}
          onShare={shareInvite}
          isSharing={createInvitationMutation.isPending}
        />
      </View>
    </SafeAreaView>
  );
}
