import React from "react";
import { View, Text } from "react-native";
import { BatteryCharging, BatteryMedium, Wifi } from "lucide-react-native";
import { Card } from "@/components/ui/Card";
import { DeviceStatus } from "@/types/home.types";
import { formatRelativeTime } from "@/utils/formatters";

interface DeviceStatusCardProps {
  device: DeviceStatus;
}

export const DeviceStatusCard = ({ device }: DeviceStatusCardProps) => (
  <Card className="flex-row items-center justify-between mb-3">
    <View className="flex-row items-center gap-3">
      <View
        className={`w-3 h-3 rounded-full ${
          device.isOnline ? "bg-alert-low" : "bg-gray-300"
        }`}
      />
      <View>
        <Text className="text-sm font-semibold text-eldora-text">
          {device.name}
        </Text>
        <Text className="text-xs text-eldora-text-muted">
          {device.isOnline
            ? "Online"
            : `Last seen: ${
                device.lastSeen ? formatRelativeTime(device.lastSeen) : "Never"
              }`}
        </Text>
        <View className="flex-row items-center gap-3 mt-2">
          <View className="flex-row items-center gap-1">
            {device.isCharging ? (
              <BatteryCharging size={13} color="#38A169" />
            ) : (
              <BatteryMedium size={13} color="#8A8A8A" />
            )}
            <Text className="text-[11px] text-eldora-text-muted">
              {device.batteryLevel ?? "--"}%
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Wifi size={13} color={device.wifiSsid ? "#D95545" : "#8A8A8A"} />
            <Text className="text-[11px] text-eldora-text-muted" numberOfLines={1}>
              {device.wifiSsid ?? "No WiFi"}
            </Text>
          </View>
        </View>
      </View>
    </View>
    <View
      className={`px-3 py-1 rounded-full ${
        device.isOnline ? "bg-green-100" : "bg-gray-100"
      }`}
    >
      <Text
        className={`text-xs font-medium ${
          device.isOnline ? "text-green-700" : "text-gray-500"
        }`}
      >
        {device.isOnline ? "Active" : "Offline"}
      </Text>
    </View>
  </Card>
);
