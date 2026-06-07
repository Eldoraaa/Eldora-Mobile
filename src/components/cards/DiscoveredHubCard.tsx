import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Router as RouterIcon } from "lucide-react-native";
import { COLORS } from "@/constants/theme";
import { LocalProvisioningInfo } from "@/types/device.types";

type DiscoveredHubCardProps = {
  hub: LocalProvisioningInfo;
  onWifiSetup: () => void;
};

export function DiscoveredHubCard({
  hub,
  onWifiSetup,
}: DiscoveredHubCardProps) {
  return (
    <View className="mb-3 rounded-[22px] bg-white p-4">
      <View className="flex-row items-center gap-3">
        <View
          className="h-11 w-11 items-center justify-center rounded-2xl"
          style={{ backgroundColor: COLORS.coralSoft }}
        >
          <RouterIcon size={21} color={COLORS.coral} />
        </View>
        <View className="flex-1">
          <Text
            className="text-[15px] font-bold"
            style={{ color: COLORS.text }}
          >
            DoraBot
          </Text>
          <Text
            className="mt-0.5 text-xs"
            style={{ color: COLORS.muted }}
          >
            {hub.ipAddress} - {hub.hasWifi ? "Home WiFi" : "Setup mode"}
          </Text>
        </View>
      </View>
      <View className="mt-4 flex-row gap-3">
        <TouchableOpacity
          onPress={onWifiSetup}
          className="h-11 flex-1 items-center justify-center rounded-2xl"
          style={{ backgroundColor: COLORS.surfaceMuted }}
          activeOpacity={0.82}
        >
          <Text
            className="text-[13px] font-bold"
            style={{ color: COLORS.text }}
          >
            WiFi
          </Text>
        </TouchableOpacity>
        <View
          className="h-11 flex-1 items-center justify-center rounded-2xl"
          style={{ backgroundColor: COLORS.coralSoft }}
        >
          <Text
            className="text-[13px] font-bold"
            style={{ color: COLORS.text }}
          >
            Auto detected
          </Text>
        </View>
      </View>
    </View>
  );
}
