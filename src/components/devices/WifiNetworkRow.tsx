import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Wifi } from "lucide-react-native";
import { COLORS } from "@/constants/theme";
import { WifiNetwork } from "@/types/device.types";
import { signalLabel } from "@/utils/device.utils";

type WifiNetworkRowProps = {
  network: WifiNetwork;
  onPress: () => void;
};

export function WifiNetworkRow({ network, onPress }: WifiNetworkRowProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center border-t border-[#EEF3F7] py-3"
      activeOpacity={0.82}
    >
      <View className="mr-3 h-10 w-10 items-center justify-center rounded-2xl bg-white">
        <Wifi size={18} color={COLORS.coral} />
      </View>
      <View className="flex-1">
        <Text
          className="text-[14px] font-bold"
          style={{ color: COLORS.text }}
          numberOfLines={1}
        >
          {network.ssid}
        </Text>
        <Text
          className="mt-0.5 text-[12px] font-semibold"
          style={{ color: COLORS.muted }}
        >
          {signalLabel(network.rssi)}
          {network.secure ? " - Secured" : " - Open"}
        </Text>
      </View>
      <Text className="text-[12px] font-bold" style={{ color: COLORS.coral }}>
        Select
      </Text>
    </TouchableOpacity>
  );
}
