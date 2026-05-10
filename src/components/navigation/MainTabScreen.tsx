import React from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomNav, BottomNavRoute } from "./BottomNav";

type MainTabScreenProps = {
  active: BottomNavRoute;
  children: React.ReactNode;
};

export function MainTabScreen({ active, children }: MainTabScreenProps) {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="mx-auto w-full max-w-[430px] flex-1">
        {children}
        <BottomNav active={active} bordered />
      </View>
    </SafeAreaView>
  );
}
