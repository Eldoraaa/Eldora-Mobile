import React, { useEffect, useRef, useState } from "react";
import {
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
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
  useDevicesScreenQuery,
  useDiscoverLocalHubsMutation,
  usePairLocalDeviceMutation,
} from "@/hooks/useDeviceQueries";
import { useBackNavigation } from "@/hooks/useBackNavigation";
import { useSelectedHome } from "@/hooks/useSelectedHome";
import { LocalProvisioningInfo } from "@/types/device.types";

function isAlreadyPairedHub(hub: LocalProvisioningInfo, devices: { deviceId: string }[]) {
  return devices.some((device) => device.deviceId === hub.deviceKey);
}

const MANUAL_DEVICE_TYPES = [
  {
    title: "DoraBot",
    Icon: RouterIcon,
    action: "scan-dorabot",
  },
  {
    title: "DoraShield",
    Icon: ShieldCheck,
    action: "dorashield",
  },
] as const;

export default function AddDeviceScreen() {
  const goBack = useBackNavigation("/home");
  const params = useLocalSearchParams<{ type?: string; fromSetup?: string }>();
  const [nearbyHubs, setNearbyHubs] = useState<LocalProvisioningInfo[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isWifiOn, setIsWifiOn] = useState<boolean | null>(null);
  const [elderName, setElderName] = useState("");
  const { selectedHomeId } = useSelectedHome();
  const devicesQuery = useDevicesScreenQuery(selectedHomeId);
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

  const findNearbyDoraBot = async (silent = false) => {
    if (isSearchingRef.current) return;
    isSearchingRef.current = true;
    setIsSearching(true);
    try {
      const onWifi = await refreshWifiStatus();
      if (!onWifi) {
        setNearbyHubs([]);
        return;
      }

      const result = await devicesQuery.refetch();
      const pairedDevices = result.data?.devices ?? [];
      const hubs = await discoverLocalHubsMutation.mutateAsync();
      const unpairedHubs = hubs.filter((hub) => !isAlreadyPairedHub(hub, pairedDevices));
      setNearbyHubs(unpairedHubs);
      if (!silent && unpairedHubs.length > 0) {
        Toast.show({
          type: "success",
          text1: "DoraBot found",
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
        params.type === "dorabot" && params.fromSetup === "1";
      await findNearbyDoraBot(!shouldShowResult);
    };

    void scan();
    const networkSubscription = Network.addNetworkStateListener((state) => {
      const onWifi = state.type === Network.NetworkStateType.WIFI;
      setIsWifiOn(onWifi);
      if (onWifi) void scan();
      else setNearbyHubs([]);
    });
    const interval = setInterval(() => {
      void scan();
    }, 20000);

    return () => {
      isMounted = false;
      networkSubscription.remove();
      clearInterval(interval);
    };
  }, []);

  const pairHub = async (hub: LocalProvisioningInfo) => {
    const trimmedElderName = elderName.trim();
    if (!trimmedElderName) {
      Toast.show({
        type: "error",
        text1: "Elder name required",
        text2: "Add the elder's preferred name before pairing.",
      });
      return;
    }

    try {
      const result = await pairLocalDeviceMutation.mutateAsync({
        deviceKey: hub.deviceKey,
        pairingToken: hub.pairingToken,
        localIp: hub.ipAddress,
        elderName: trimmedElderName,
        deviceName: "DoraBot",
        homeId: selectedHomeId,
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
              <View className="mx-5 rounded-[24px] border border-[#F1F1F1] bg-white px-5 py-4">
                <Text className="text-[13px] font-extrabold uppercase tracking-[1.2px] text-[#8A8A8A]">
                  Elder preferred name
                </Text>
                <TextInput
                  className="mt-3 text-[18px] font-bold text-[#17202A]"
                  value={elderName}
                  onChangeText={setElderName}
                  placeholder="e.g. Pak Budi"
                  placeholderTextColor="#B8BFC5"
                  autoCapitalize="words"
                  autoComplete="name"
                  accessibilityLabel="Elder preferred name"
                />
              </View>
              <Text className="mt-8 px-8 text-[15px] font-extrabold uppercase text-[#5F6B7A]">
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
                      if (deviceType.action === "scan-dorabot") {
                        router.push("/device-setup?type=dorabot" as never);
                        return;
                      }

                      router.push("/device-setup?type=dorashield" as never);
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
