import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Wifi } from "lucide-react-native";
import { WifiNetwork } from "@/types/device.types";

function wifiStrengthLabel(rssi: number) {
  if (rssi >= -55) return "Strong";
  if (rssi >= -70) return "Fair";
  return "Weak";
}

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
        <Wifi size={18} color="#7BA7D4" />
      </View>
      <View className="flex-1">
        <Text className="text-[14px] font-bold text-[#1F2A37]" numberOfLines={1}>
          {network.ssid}
        </Text>
        <Text className="mt-0.5 text-[12px] font-semibold text-[#7B8794]">
          {wifiStrengthLabel(network.rssi)}
          {network.secure ? " - Secured" : " - Open"}
        </Text>
      </View>
      <Text className="text-[12px] font-bold text-[#2477F2]">Select</Text>
    </TouchableOpacity>
  );
}
