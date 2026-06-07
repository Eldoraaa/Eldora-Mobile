import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import {
  BatteryCharging,
  ChevronRight,
  Router as RouterIcon,
  Wifi,
} from "lucide-react-native";
import { COLORS } from "@/constants/theme";
import { LocalProvisioningInfo } from "@/types/device.types";
import { signalLabel } from "@/utils/device.utils";

type NearbyHubRowProps = {
  hub: LocalProvisioningInfo;
  onPress: () => void;
  demo?: boolean;
};

function HubMeta({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View className="mr-4 mb-3 min-w-[42%]">
      <Text
        className="text-[11px] font-extrabold uppercase leading-4"
        style={{ color: COLORS.muted }}
      >
        {label}
      </Text>
      <Text
        className="mt-1 text-[13px] font-bold leading-5"
        style={{ color: COLORS.text }}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

export function NearbyHubRow({ hub, onPress, demo = false }: NearbyHubRowProps) {
  const setupNetwork = hub.setupSsid || "Eldora_Setup";
  const networkLabel = hub.hasWifi
    ? hub.wifiSsid ?? "Home Wi-Fi"
    : setupNetwork;
  const powerLabel =
    hub.batteryLevel === null || hub.batteryLevel === undefined
      ? hub.isCharging
        ? "Plugged in"
        : "Unknown"
      : `${hub.batteryLevel}%${hub.isCharging ? " charging" : ""}`;

  return (
    <TouchableOpacity
      className="mx-5 mt-4 rounded-[22px] border px-5 py-5"
      style={{ borderColor: COLORS.line, backgroundColor: "#FFFFFF" }}
      activeOpacity={0.78}
      onPress={onPress}
    >
      <View className="flex-row items-start">
        <View
          className="mr-4 h-12 w-12 items-center justify-center rounded-[18px]"
          style={{ backgroundColor: COLORS.surfaceMuted }}
        >
          <RouterIcon size={23} color={COLORS.coral} />
        </View>
        <View className="flex-1">
          <View className="flex-row items-center">
            <Text
              className="flex-1 text-[18px] font-extrabold leading-6"
              style={{ color: COLORS.text }}
              numberOfLines={1}
            >
              DoraBot
            </Text>
            {demo ? (
              <View
                className="rounded-full px-2.5 py-1"
                style={{ backgroundColor: COLORS.coralSoft }}
              >
                <Text
                  className="text-[11px] font-extrabold"
                  style={{ color: COLORS.coral }}
                >
                  Demo
                </Text>
              </View>
            ) : null}
          </View>
          <Text
            className="mt-1 text-[13px] font-semibold leading-5"
            style={{ color: COLORS.muted }}
          >
            {hub.hasWifi ? "Ready on home Wi-Fi" : "Setup Wi-Fi is available"}
          </Text>
        </View>
      </View>

      <View className="mt-5 flex-row flex-wrap">
        <HubMeta label="Wi-Fi" value={networkLabel} />
        <HubMeta label="IP" value={hub.ipAddress || hub.setupIp} />
        <HubMeta label="Signal" value={signalLabel(hub.wifiRssi ?? null)} />
        <HubMeta label="Power" value={powerLabel} />
      </View>

      <View className="mt-2 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Wifi size={16} color={COLORS.coral} />
          <Text
            className="ml-2 text-[12px] font-bold"
            style={{ color: COLORS.muted }}
          >
            Pairing mode
          </Text>
          <BatteryCharging
            className="ml-4"
            size={16}
            color={hub.isCharging ? COLORS.success : COLORS.disabled}
          />
        </View>
        <View className="flex-row items-center">
          <Text
            className="text-[14px] font-extrabold"
            style={{ color: COLORS.coral }}
          >
            Pair
          </Text>
          <ChevronRight size={18} color={COLORS.coral} />
        </View>
      </View>
    </TouchableOpacity>
  );
}
