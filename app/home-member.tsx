import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { Check, ChevronLeft, ChevronRight } from "lucide-react-native";
import { HomeMemberAvatar } from "@/components/home/HomeMemberAvatar";
import { COLORS } from "@/constants/theme";
import { useBackNavigation } from "@/hooks/useBackNavigation";
import {
  useHomeSettingsQuery,
  useHomesQuery,
  useRemoveHomeMemberMutation,
  useUpdateHomeMemberRoleMutation,
} from "@/hooks/useHomeManagementQueries";
import { HomeMemberRole, HomeMemberRoleInput } from "@/types/home.types";

const ROLES: Array<{ label: HomeMemberRole; value: HomeMemberRoleInput }> = [
  { label: "Home Owner", value: "home_owner" },
  { label: "Administrator", value: "administrator" },
  { label: "Common Member", value: "common_member" },
];

type MemberDetailRowProps = {
  label: string;
  value?: string;
  onPress?: () => void;
  children?: React.ReactNode;
};

function MemberDetailRow({
  label,
  value,
  onPress,
  children,
}: MemberDetailRowProps) {
  const Row = onPress ? Pressable : View;

  return (
    <Row
      className="min-h-[78px] flex-row items-center px-8 py-4"
      accessibilityRole={onPress ? "button" : undefined}
      onPress={onPress}
    >
      <Text
        className="w-[132px] text-[16px] font-semibold leading-6"
        style={{ color: COLORS.text }}
      >
        {label}
      </Text>
      <View className="flex-1 items-end">
        {children ?? (
          <Text
            className="text-right text-[16px] font-semibold leading-6"
            style={{ color: COLORS.muted }}
            numberOfLines={1}
          >
            {value}
          </Text>
        )}
      </View>
      {onPress ? <ChevronRight size={24} color={COLORS.disabled} /> : null}
    </Row>
  );
}

export default function HomeMemberScreen() {
  const goBack = useBackNavigation("/home-settings");
  const params = useLocalSearchParams<{ homeId?: string; memberId?: string }>();
  const homesQuery = useHomesQuery();
  const homeId = params.homeId ?? homesQuery.data?.[0]?.id ?? null;
  const settingsQuery = useHomeSettingsQuery(homeId);
  const updateRoleMutation = useUpdateHomeMemberRoleMutation(homeId);
  const removeMemberMutation = useRemoveHomeMemberMutation(homeId);
  const [showRoleModal, setShowRoleModal] = useState(false);

  const member = useMemo(
    () =>
      settingsQuery.data?.members.find((item) => item.id === params.memberId),
    [params.memberId, settingsQuery.data?.members]
  );

  const updateRole = async (role: HomeMemberRoleInput) => {
    if (!member) return;

    try {
      await updateRoleMutation.mutateAsync({ memberId: member.id, role });
      setShowRoleModal(false);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Could not update role",
        text2: error.response?.data?.message ?? "Please try again.",
      });
    }
  };

  const removeMember = () => {
    if (!member) return;

    Alert.alert("Remove member?", `${member.name} will lose access to this home.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            await removeMemberMutation.mutateAsync(member.id);
            goBack();
          } catch (error: any) {
            Toast.show({
              type: "error",
              text1: "Could not remove member",
              text2: error.response?.data?.message ?? "Please try again.",
            });
          }
        },
      },
    ]);
  };

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
            Home Member
          </Text>
        </View>

        {settingsQuery.isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={COLORS.coral} />
          </View>
        ) : (
          <ScrollView
            className="flex-1 bg-white"
            contentContainerClassName="pb-14 pt-10"
            showsVerticalScrollIndicator={false}
          >
            <MemberDetailRow label="Name" value={member?.name ?? "Member"} />
            <MemberDetailRow label="Profile Photo">
              <HomeMemberAvatar
                size={58}
                avatarUrl={member?.avatarUrl}
                name={member?.name}
              />
            </MemberDetailRow>
            <MemberDetailRow label="Account" value={member?.email ?? "-"} />
            <MemberDetailRow
              label="Family Role"
              value={member?.role ?? "Common Member"}
              onPress={() => setShowRoleModal(true)}
            />

            <Pressable
              className="mt-16 items-center py-5"
              accessibilityRole="button"
              onPress={removeMember}
            >
              <Text className="text-[18px] font-extrabold text-[#D61F1F]">
                Remove Member
              </Text>
            </Pressable>
          </ScrollView>
        )}

        <Modal
          visible={showRoleModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowRoleModal(false)}
        >
          <View className="flex-1 justify-end bg-black/35">
            <Pressable
              className="flex-1"
              onPress={() => setShowRoleModal(false)}
            />
            <View className="rounded-t-[24px] bg-white px-6 pb-8 pt-7">
              <Text
                className="text-center text-[20px] font-extrabold"
                style={{ color: COLORS.text }}
              >
                Family Role
              </Text>
              <View className="mt-5">
                {ROLES.map((item) => (
                  <TouchableOpacity
                    key={item.value}
                    className="h-14 flex-row items-center"
                    activeOpacity={0.78}
                    onPress={() => updateRole(item.value)}
                  >
                    <Text
                      className="flex-1 text-[17px]"
                      style={{ color: COLORS.text }}
                    >
                      {item.label}
                    </Text>
                    {member?.role === item.label ? (
                      <Check size={21} color={COLORS.coral} />
                    ) : null}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}
