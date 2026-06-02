import React, { useEffect, useRef, useState } from "react";
import {
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as Network from "expo-network";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import Toast from "react-native-toast-message";
import {
  ChevronLeft,
  CircleAlert,
  Router as RouterIcon,
  ShieldCheck,
  Wifi,
} from "lucide-react-native";
import { ManualDeviceTile } from "@/components/devices/ManualDeviceTile";
import { NearbyHubRow } from "@/components/devices/NearbyHubRow";
import { ScanningRadar } from "@/components/devices/ScanningRadar";
import {
  useDiscoverLocalHubsMutation,
  usePairLocalDeviceMutation,
} from "@/hooks/useDeviceQueries";
import { useBackNavigation } from "@/hooks/useBackNavigation";
import { LocalProvisioningInfo } from "@/types/device.types";

const MANUAL_DEVICE_TYPES = [
  {
    title: "Eldora Core",
    Icon: RouterIcon,
    action: "scan-core",
  },
  {
    title: "AegisWear",
    Icon: ShieldCheck,
    action: "aegiswear",
  },
] as const;

export default function AddDeviceScreen() {
  const goBack = useBackNavigation("/home");
  const params = useLocalSearchParams<{ type?: string; fromSetup?: string }>();
  const [nearbyHubs, setNearbyHubs] = useState<LocalProvisioningInfo[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isWifiOn, setIsWifiOn] = useState<boolean | null>(null);
  const discoverLocalHubsMutation = useDiscoverLocalHubsMutation();
  const pairLocalDeviceMutation = usePairLocalDeviceMutation();
  const isSearchingRef = useRef(false);

  const refreshWifiStatus = async () => {
    const state = await Network.getNetworkStateAsync();
    const onWifi = state.type === Network.NetworkStateType.WIFI;
    setIsWifiOn(onWifi);
    return onWifi;
  };

  const openWifiSettings = async () => {
    try {
      if (Platform.OS === "android" && Linking.sendIntent) {
        await Linking.sendIntent("android.settings.WIFI_SETTINGS");
        return;
      }
      await Linking.openSettings();
    } catch {
      Toast.show({
        type: "error",
        text1: "Cannot open WiFi settings",
      });
    }
  };

  const findNearbyCore = async (silent = false) => {
    if (isSearchingRef.current) return;
    isSearchingRef.current = true;
    setIsSearching(true);
    try {
      const onWifi = await refreshWifiStatus();
      if (!onWifi) {
        setNearbyHubs([]);
        return;
      }

      const hubs = await discoverLocalHubsMutation.mutateAsync();
      setNearbyHubs(hubs);
      if (!silent && hubs.length > 0) {
        Toast.show({
          type: "success",
          text1: "Eldora Core found",
          text2: "Choose the device below to pair it.",
        });
      }
    } finally {
      isSearchingRef.current = false;
      setIsSearching(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const scan = async () => {
      if (!isMounted) return;
      const shouldShowResult =
        params.type === "core" && params.fromSetup === "1";
      await findNearbyCore(!shouldShowResult);
    };

    void scan();
    const interval = setInterval(() => {
      void scan();
    }, 20000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const pairHub = async (hub: LocalProvisioningInfo) => {
    try {
      const result = await pairLocalDeviceMutation.mutateAsync({
        deviceKey: hub.deviceKey,
        pairingToken: hub.pairingToken,
        localIp: hub.ipAddress,
        elderName: "Eldora User",
        deviceName: "Eldora Core",
        batteryLevel: hub.batteryLevel ?? undefined,
        isCharging: hub.isCharging,
        wifiSsid: hub.wifiSsid ?? undefined,
        wifiRssi: hub.wifiRssi ?? undefined,
        firmwareVersion: hub.firmwareVersion,
      });

      Toast.show({
        type: "success",
        text1: result.kind === "paired" ? "Device paired" : "Request sent",
      });
      router.replace("/home" as never);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Pairing failed",
        text2: "Check WiFi and try again.",
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
            onPress={goBack}
          >
            <ChevronLeft size={30} color="#17202A" strokeWidth={2.4} />
          </Pressable>
          <Text className="flex-1 pr-11 text-center text-[22px] font-extrabold leading-7 text-[#17202A]">
            Add Device
          </Text>
        </View>

        <ScrollView
          className="flex-1 bg-white"
          contentContainerClassName="pb-12 pt-8"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-row px-8">
            <ScanningRadar />
            <Text className="flex-1 text-center text-[16px] font-normal leading-7 text-[#17202A]">
              Searching for nearby Eldora devices. Make sure your device has entered{" "}
              <Text className="text-[#D95545]">pairing mode</Text>
            </Text>
          </View>

          {isWifiOn === false ? (
            <TouchableOpacity
              className="mx-5 mt-8 flex-row items-center rounded-[20px] bg-[#FAF7F2] px-5 py-5"
              activeOpacity={0.82}
              onPress={openWifiSettings}
            >
              <View className="mr-4 h-11 w-11 items-center justify-center rounded-full bg-white">
                <Wifi size={21} color="#D95545" />
              </View>
              <View className="flex-1">
                <Text className="text-[16px] font-semibold leading-6 text-[#17202A]">
                  Turn on Wi-Fi
                </Text>
                <Text className="mt-1 text-[14px] font-normal leading-5 text-[#8A8A8A]">
                  Wi-Fi is required to find and pair Eldora devices.
                </Text>
              </View>
              <View className="ml-3 h-6 w-6 items-center justify-center rounded-full bg-[#FFE7E2]">
                <CircleAlert size={17} color="#D95545" />
              </View>
            </TouchableOpacity>
          ) : null}

          {nearbyHubs.length > 0 ? (
            <View className="mt-8">
              <Text className="px-8 text-[15px] font-extrabold uppercase text-[#5F6B7A]">
                Nearby devices
              </Text>
              {nearbyHubs.map((hub) => (
                <NearbyHubRow
                  key={`${hub.deviceKey}-${hub.ipAddress}`}
                  hub={hub}
                  onPress={() => pairHub(hub)}
                />
              ))}
            </View>
          ) : null}

          <View className="mx-5 mt-10 h-px bg-[#F1F1F1]" />

          <View className="pt-8">
            <Text className="text-center text-[18px] font-extrabold leading-6 text-[#17202A]">
              Add Manually
            </Text>

            <View className="mt-9 px-6">
              <View className="flex-row flex-wrap items-start">
                {MANUAL_DEVICE_TYPES.map((deviceType) => (
                  <ManualDeviceTile
                    key={deviceType.title}
                    title={deviceType.title}
                    Icon={deviceType.Icon}
                    onPress={() => {
                      if (deviceType.action === "scan-core") {
                        router.push("/device-setup?type=core" as never);
                        return;
                      }

                      router.push("/device-setup?type=aegiswear" as never);
                    }}
                  />
                ))}
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
