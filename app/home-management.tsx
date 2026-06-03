import React, { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import Toast from "react-native-toast-message";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { CreateHomeModal } from "@/components/home/CreateHomeModal";
import { HomeManagementRow } from "@/components/home/HomeManagementRow";
import { COLORS } from "@/constants/theme";
import { useBackNavigation } from "@/hooks/useBackNavigation";
import {
  useCreateHomeMutation,
  useHomesQuery,
} from "@/hooks/useHomeManagementQueries";

export default function HomeManagementScreen() {
  const goBack = useBackNavigation("/home");
  const homesQuery = useHomesQuery();
  const createHomeMutation = useCreateHomeMutation();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [homeName, setHomeName] = useState("");

  const createHome = async () => {
    const name = homeName.trim();
    if (!name) return;

    try {
      const home = await createHomeMutation.mutateAsync({ name });
      setShowCreateModal(false);
      setHomeName("");
      router.push({
        pathname: "/home-settings",
        params: { homeId: home.id },
      } as never);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Could not create home",
        text2: error.response?.data?.message ?? "Please try again.",
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="mx-auto w-full max-w-[430px] flex-1 bg-white">
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
            Home Management
          </Text>
        </View>

        <ScrollView
          className="flex-1 bg-white"
          contentContainerClassName="pb-12 pt-8"
          showsVerticalScrollIndicator={false}
        >
          {homesQuery.isLoading ? (
            <View className="items-center py-12">
              <ActivityIndicator color={COLORS.coral} />
            </View>
          ) : null}

          {(homesQuery.data ?? []).map((home) => (
            <HomeManagementRow key={home.id} home={home} />
          ))}

          <View className="mt-8 px-8">
            <Pressable
              className="py-4"
              accessibilityRole="button"
              accessibilityLabel="Create a home"
              onPress={() => setShowCreateModal(true)}
            >
              <Text
                className="text-[18px] font-extrabold leading-7"
                style={{ color: COLORS.coral }}
              >
                Create a home
              </Text>
            </Pressable>
            <Pressable
              className="mt-4 py-4"
              accessibilityRole="button"
              accessibilityLabel="Join a home"
              onPress={() => router.push("/join-home")}
            >
              <Text
                className="text-[18px] font-extrabold leading-7"
                style={{ color: COLORS.coral }}
              >
                Join a home
              </Text>
            </Pressable>
          </View>
        </ScrollView>

        <CreateHomeModal
          visible={showCreateModal}
          value={homeName}
          isPending={createHomeMutation.isPending}
          onChange={setHomeName}
          onSubmit={createHome}
          onClose={() => setShowCreateModal(false)}
        />
      </View>
    </SafeAreaView>
  );
}
