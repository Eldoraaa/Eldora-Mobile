import React, { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenHeader } from "@/components/navigation/ScreenHeader";
import { SettingsRow } from "@/components/settings/SettingsRow";
import { useBackNavigation } from "@/hooks/useBackNavigation";
import { queryClient } from "@/lib/queryClient";
import { clearAppCache, formatBytes, getAppCacheSize } from "@/utils/cache.utils";

export default function AccountSettingsScreen() {
  const goBack = useBackNavigation("/settings");
  const [cacheSize, setCacheSize] = useState(0);
  const cacheLabel = formatBytes(cacheSize);

  useEffect(() => {
    void getAppCacheSize(queryClient).then(setCacheSize);
  }, []);

  const clearCache = async () => {
    const clearedSize = await clearAppCache(queryClient);
    setCacheSize(0);
    Toast.show({
      type: "success",
      text1: "Cache cleared successfully",
      text2: `${formatBytes(clearedSize)} cleared`,
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="mx-auto w-full max-w-[430px] flex-1 bg-white">
        <ScreenHeader title="Settings" onBack={goBack} />

        <ScrollView
          className="flex-1 bg-white"
          contentContainerClassName="pb-12 pt-8"
          showsVerticalScrollIndicator={false}
        >
          <SettingsRow
            title="Personal Information"
            onPress={() => router.push("/personal-information" as never)}
          />
          <SettingsRow
            title="Account and Security"
            onPress={() => router.push("/account-security" as never)}
          />
          <SettingsRow
            title="App Notification"
            onPress={() => router.push("/notification-settings" as never)}
          />
          <SettingsRow
            title="Clear Cache"
            value={cacheLabel}
            showChevron={false}
            onPress={clearCache}
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
