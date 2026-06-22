import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Share,
  Text,
  TextInput,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
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
  useCreateEmergencyContactMutation,
  useCreateHomeInvitationMutation,
  useDeleteEmergencyContactMutation,
  useEmergencyContactsQuery,
  useHomeSettingsQuery,
  useHomesQuery,
  useRemoveHomeMemberMutation,
  useUpdateHomeMutation,
} from "@/hooks/useHomeManagementQueries";
import { useAuthStore } from "@/stores/authStore";

export default function HomeSettingsScreen() {
  const goBack = useBackNavigation("/home-management");
  const params = useLocalSearchParams<{ homeId?: string }>();
  const homesQuery = useHomesQuery();
  const fallbackHomeId = homesQuery.data?.[0]?.id;
  const homeId = params.homeId ?? fallbackHomeId ?? null;
  const settingsQuery = useHomeSettingsQuery(homeId);
  const emergencyContactsQuery = useEmergencyContactsQuery(homeId);
  const updateHomeMutation = useUpdateHomeMutation(homeId);
  const createInvitationMutation = useCreateHomeInvitationMutation(homeId);
  const removeHomeMemberMutation = useRemoveHomeMemberMutation(homeId);
  const createEmergencyContactMutation = useCreateEmergencyContactMutation();
  const deleteEmergencyContactMutation = useDeleteEmergencyContactMutation();
  const home = settingsQuery.data;
  const currentUser = useAuthStore((state) => state.user);
  const currentMember = home?.members.find((member) => member.userId === currentUser?.id);
  const [draftHomeName, setDraftHomeName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [showNameModal, setShowNameModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);

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

  const saveEmergencyContact = async () => {
    const name = contactName.trim();
    const phone = contactPhone.trim();
    if (!name || !phone) {
      Toast.show({
        type: "error",
        text1: "Contact is incomplete",
        text2: "Add both name and phone number.",
      });
      return;
    }

    try {
      await createEmergencyContactMutation.mutateAsync({
        name,
        phone,
        isPrimary: (emergencyContactsQuery.data ?? []).length === 0,
        homeId,
      });
      setContactName("");
      setContactPhone("");
      setShowContactModal(false);
      Toast.show({ type: "success", text1: "Emergency contact saved" });
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Could not save contact",
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

  const leaveHome = () => {
    if (!currentMember || !home) return;
    setShowLeaveModal(true);
  };

  const confirmLeaveHome = async () => {
    if (!currentMember) return;

    try {
      await removeHomeMemberMutation.mutateAsync(currentMember.id);
      setShowLeaveModal(false);
      Toast.show({ type: "success", text1: "You left the home" });
      router.replace("/home-management" as never);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Could not leave home",
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
              Emergency Contact
            </Text>
            <View className="mt-5">
              {(emergencyContactsQuery.data ?? []).slice(0, 2).map((contact) => (
                <HomeSettingsRow
                  key={contact.id}
                  label={contact.name}
                  value={`${contact.phone} · Remove`}
                  onPress={() =>
                    Alert.alert("Remove contact?", `Remove ${contact.name} from emergency contacts?`, [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Remove",
                        style: "destructive",
                        onPress: () =>
                          deleteEmergencyContactMutation.mutate(contact.id, {
                            onSuccess: () => Toast.show({ type: "success", text1: "Contact removed" }),
                            onError: () => Toast.show({ type: "error", text1: "Could not remove contact" }),
                          }),
                      },
                    ])
                  }
                />
              ))}
              <Pressable
                className="px-8 py-5"
                accessibilityRole="button"
                onPress={() => setShowContactModal(true)}
              >
                <Text className="text-[16px] font-extrabold leading-6" style={{ color: COLORS.coral }}>
                  Add Emergency Contact
                </Text>
              </Pressable>
            </View>

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

            {currentMember?.role !== "Common Member" ? (
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
            ) : null}

            <Pressable
              className="items-center px-8 py-5"
              accessibilityRole="button"
              accessibilityLabel="Leave home"
              onPress={leaveHome}
            >
              <Text className="text-center text-[15px] font-extrabold leading-6 text-[#D61F1F]">
                Leave Home
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

        <Modal transparent visible={showContactModal} animationType="fade" accessibilityViewIsModal onRequestClose={() => setShowContactModal(false)}>
          <KeyboardAvoidingView className="flex-1" behavior="translate-with-padding">
            <Pressable className="flex-1 justify-end bg-black/40" onPress={() => setShowContactModal(false)}>
              <Pressable
                className="max-h-[78%] rounded-t-[28px] bg-white"
                accessibilityRole="summary"
                accessibilityLabel="Emergency contact form"
                onPress={(event) => event.stopPropagation()}
              >
                <ScrollView
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                  contentContainerClassName="px-7 pb-8 pt-7"
                >
                  <View className="mb-5 h-1.5 w-12 self-center rounded-full bg-[#E8ECEF]" />
                  <Text className="text-[22px] font-extrabold" style={{ color: COLORS.text }}>
                    Emergency Contact
                  </Text>
                  <Text className="mt-2 text-[14px] font-semibold leading-5" style={{ color: COLORS.muted }}>
                    This contact appears as a one-tap call action during alerts.
                  </Text>
                  <TextInput
                    value={contactName}
                    onChangeText={setContactName}
                    placeholder="Name"
                    placeholderTextColor={COLORS.disabled}
                    className="mt-6 h-[52px] rounded-[14px] border px-4 text-[15px] font-semibold"
                    style={{ borderColor: COLORS.line, color: COLORS.text }}
                    accessibilityLabel="Emergency contact name"
                    autoComplete="name"
                    returnKeyType="next"
                  />
                  <TextInput
                    value={contactPhone}
                    onChangeText={setContactPhone}
                    placeholder="Phone number"
                    placeholderTextColor={COLORS.disabled}
                    keyboardType="phone-pad"
                    className="mt-3 h-[52px] rounded-[14px] border px-4 text-[15px] font-semibold"
                    style={{ borderColor: COLORS.line, color: COLORS.text }}
                    accessibilityLabel="Emergency contact phone"
                    autoComplete="tel"
                    textContentType="telephoneNumber"
                    returnKeyType="done"
                    onSubmitEditing={saveEmergencyContact}
                  />
                  <Pressable
                    className="mt-5 h-[52px] items-center justify-center rounded-[16px]"
                    style={{ backgroundColor: COLORS.coral }}
                    accessibilityRole="button"
                    disabled={createEmergencyContactMutation.isPending}
                    onPress={saveEmergencyContact}
                  >
                    <Text className="font-extrabold text-white">
                      {createEmergencyContactMutation.isPending ? "Saving..." : "Save Contact"}
                    </Text>
                  </Pressable>
                </ScrollView>
              </Pressable>
            </Pressable>
          </KeyboardAvoidingView>
        </Modal>

        <ShareInviteSheet
          visible={showShareModal}
          role="Common Member"
          onClose={() => setShowShareModal(false)}
          onShare={shareInvite}
          isSharing={createInvitationMutation.isPending}
        />

        <Modal transparent visible={showLeaveModal} animationType="fade" accessibilityViewIsModal onRequestClose={() => setShowLeaveModal(false)}>
          <Pressable className="flex-1 justify-end bg-black/40" onPress={() => setShowLeaveModal(false)}>
            <Pressable
              className="rounded-t-[28px] bg-white px-7 pb-8 pt-7"
              accessibilityRole="summary"
              accessibilityLabel="Leave home confirmation"
              onPress={(event) => event.stopPropagation()}
            >
              <View className="mb-5 h-1.5 w-12 self-center rounded-full bg-[#E8ECEF]" />
              <Text className="text-[22px] font-extrabold" style={{ color: COLORS.text }}>
                Leave {home?.name ?? "home"}?
              </Text>
              <Text className="mt-2 text-[14px] font-semibold leading-5" style={{ color: COLORS.muted }}>
                You will lose access to this home and its devices. You can only rejoin with a new invite.
              </Text>
              <View className="mt-7 flex-row gap-3">
                <Pressable
                  className="h-[52px] flex-1 items-center justify-center rounded-2xl border"
                  style={{ borderColor: COLORS.line }}
                  accessibilityRole="button"
                  onPress={() => setShowLeaveModal(false)}
                >
                  <Text className="text-[15px] font-extrabold" style={{ color: COLORS.muted }}>
                    Cancel
                  </Text>
                </Pressable>
                <Pressable
                  className="h-[52px] flex-1 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: COLORS.coral }}
                  accessibilityRole="button"
                  disabled={removeHomeMemberMutation.isPending}
                  onPress={confirmLeaveHome}
                >
                  <Text className="text-[15px] font-extrabold text-white">
                    {removeHomeMemberMutation.isPending ? "Leaving..." : "Leave Home"}
                  </Text>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    </SafeAreaView>
  );
}
