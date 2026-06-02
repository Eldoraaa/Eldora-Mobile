import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import Toast from "react-native-toast-message";
import {
  Router as RouterIcon,
  ShieldCheck,
  Wifi,
  X,
} from "lucide-react-native";
import { NearbyHubRow } from "@/components/devices/NearbyHubRow";
import { ScanningRadar } from "@/components/devices/ScanningRadar";
import {
  useDiscoverLocalHubsMutation,
  usePairLocalDeviceMutation,
} from "@/hooks/useDeviceQueries";
import { COLORS } from "@/constants/theme";
import { LocalProvisioningInfo } from "@/types/device.types";

type SetupType = "core" | "aegiswear";
type SetupPhase = "guide" | "searching" | "found" | "not-found";

const SETUP_COPY = {
  core: {
    title: "Reset Eldora Core",
    product: "Eldora Core",
    mode: "Wi-Fi pairing",
    steps: [
      "Power on Eldora Core.",
      "Hold the PAIR button for 5 seconds until the indicator blinks.",
      "Keep this phone on the same Wi-Fi, then start pairing.",
    ],
  },
  aegiswear: {
    title: "Prepare AegisWear",
    product: "AegisWear",
    mode: "Wearable pairing",
    steps: [
      "Charge and power on AegisWear.",
      "Attach it to the upper-body wearable layer.",
      "Hold the PAIR button for 5 seconds and keep it near Eldora Core.",
    ],
  },
} as const;

function PairingStepVisual({
  setupType,
  stepIndex,
  onStepPress,
}: {
  setupType: SetupType;
  stepIndex: number;
  onStepPress: (index: number) => void;
}) {
  const mutedStroke = "#B8BFC5";
  const activeStroke = COLORS.coral;
  const stroke = stepIndex === 1 ? activeStroke : mutedStroke;

  return (
    <View className="mt-16 h-[178px] items-center justify-center">
      <View className="flex-row items-center justify-center gap-12">
        {setupType === "core" ? (
          <>
            <View className="h-24 w-20 items-center justify-center rounded-[22px] bg-white">
              <RouterIcon size={54} color={stroke} strokeWidth={1.55} />
              <View
                className="mt-2 h-2 w-8 rounded-full"
                style={{ backgroundColor: stepIndex === 1 ? COLORS.coral : mutedStroke }}
              />
            </View>
            <View className="h-24 w-20 items-center justify-center rounded-[22px] bg-white">
              <Wifi
                size={56}
                color={stepIndex === 2 ? COLORS.coral : mutedStroke}
                strokeWidth={1.55}
              />
            </View>
          </>
        ) : (
          <>
            <View className="h-24 w-20 items-center justify-center rounded-[22px] bg-white">
              <ShieldCheck size={56} color={stroke} strokeWidth={1.55} />
            </View>
            <View className="h-24 w-20 items-center justify-center rounded-[22px] bg-white">
              <RouterIcon
                size={54}
                color={stepIndex === 2 ? COLORS.coral : mutedStroke}
                strokeWidth={1.55}
              />
            </View>
          </>
        )}
      </View>
      <View className="mt-9 flex-row justify-center gap-3">
        {[0, 1, 2].map((index) => (
          <Pressable
            key={index}
            className="h-8 w-8 items-center justify-center rounded-full"
            style={{
              backgroundColor: index === stepIndex ? COLORS.text : "#FFFFFF",
              borderColor: index === stepIndex ? COLORS.text : COLORS.disabled,
              borderWidth: 1,
            }}
            accessibilityRole="button"
            onPress={() => onStepPress(index)}
          >
            <Text
              className="text-[13px] font-extrabold leading-4"
              style={{ color: index === stepIndex ? "#FFFFFF" : COLORS.muted }}
            >
              {index + 1}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function SearchingProgress() {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(progress, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: false,
        }),
        Animated.timing(progress, {
          toValue: 0,
          duration: 0,
          useNativeDriver: false,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [progress]);

  const width = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["14%", "82%"],
  });

  return (
    <View className="mt-10 h-2 w-full overflow-hidden rounded-full bg-[#ECECEC]">
      <Animated.View
        className="h-2 rounded-full"
        style={{ width, backgroundColor: COLORS.coral }}
      />
    </View>
  );
}

export default function DeviceSetupScreen() {
  const params = useLocalSearchParams<{ type?: string }>();
  const setupType: SetupType = params.type === "aegiswear" ? "aegiswear" : "core";
  const copy = SETUP_COPY[setupType];
  const [stepIndex, setStepIndex] = useState(0);
  const [phase, setPhase] = useState<SetupPhase>("guide");
  const [nearbyHubs, setNearbyHubs] = useState<LocalProvisioningInfo[]>([]);
  const discoverLocalHubsMutation = useDiscoverLocalHubsMutation();
  const pairLocalDeviceMutation = usePairLocalDeviceMutation();
  const isLastStep = stepIndex === copy.steps.length - 1;

  useEffect(() => {
    setStepIndex(0);
  }, [setupType]);

  const closeSetup = () => {
    if (phase === "guide") {
      router.replace("/add-device" as never);
      return;
    }
    setPhase("guide");
  };

  const startPairingSearch = async () => {
    setNearbyHubs([]);
    setPhase("searching");

    if (setupType === "aegiswear") {
      await new Promise((resolve) => setTimeout(resolve, 2600));
      setPhase("not-found");
      return;
    }

    const hubs = await discoverLocalHubsMutation.mutateAsync();
    setNearbyHubs(hubs);
    setPhase(hubs.length > 0 ? "found" : "not-found");
  };

  const advanceTutorial = () => {
    if (!isLastStep) {
      setStepIndex((current) => current + 1);
      return;
    }

    void startPairingSearch();
  };

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
    } catch {
      Toast.show({
        type: "error",
        text1: "Pairing failed",
        text2: "Check Wi-Fi and try again.",
      });
    }
  };

  if (phase === "searching") {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="mx-auto w-full max-w-[430px] flex-1 bg-white px-8">
          <Pressable className="mt-5 h-12 w-12 items-center justify-center" onPress={closeSetup}>
            <X size={36} color={COLORS.text} strokeWidth={2.2} />
          </Pressable>
          <View className="mt-24 items-center">
            <Text
              className="text-center text-[26px] font-extrabold leading-8"
              style={{ color: COLORS.text }}
            >
              Connecting Device
            </Text>
            <Text
              className="mt-5 text-center text-[17px] font-semibold leading-6"
              style={{ color: COLORS.muted }}
            >
              Power on the device.
            </Text>
            <View className="mt-24 h-28 w-28 items-center justify-center">
              <ScanningRadar />
            </View>
            <SearchingProgress />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (phase === "not-found") {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="mx-auto w-full max-w-[430px] flex-1 bg-white px-8">
          <Pressable className="mt-5 h-12 w-12 items-center justify-center" onPress={closeSetup}>
            <X size={36} color={COLORS.text} strokeWidth={2.2} />
          </Pressable>
          <View className="mt-24">
            <Text
              className="text-[26px] font-extrabold leading-8"
              style={{ color: COLORS.text }}
            >
              No device found
            </Text>
            <Text
              className="mt-8 text-[20px] font-extrabold leading-7"
              style={{ color: COLORS.text }}
            >
              Check these points and retry
            </Text>
            <View className="mt-8">
              {[
                "Check if the device is connected to a network.",
                "Check whether the device is near your phone.",
              ].map((item) => (
                <View key={item} className="mb-5 flex-row">
                  <Text
                    className="mr-4 text-[16px] leading-6"
                    style={{ color: COLORS.muted }}
                  >
                    -
                  </Text>
                  <Text
                    className="flex-1 text-[16px] font-semibold leading-6"
                    style={{ color: COLORS.muted }}
                  >
                    {item}
                  </Text>
                </View>
              ))}
            </View>
          </View>
          <View className="mt-auto pb-10">
            <TouchableOpacity
              className="h-[58px] items-center justify-center rounded-[16px]"
              style={{ backgroundColor: COLORS.coral }}
              activeOpacity={0.82}
              onPress={startPairingSearch}
            >
              <Text className="text-[17px] font-extrabold text-white">Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (phase === "found") {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="mx-auto w-full max-w-[430px] flex-1 bg-white">
          <View className="px-8">
            <Pressable className="mt-5 h-12 w-12 items-center justify-center" onPress={closeSetup}>
              <X size={36} color={COLORS.text} strokeWidth={2.2} />
            </Pressable>
            <Text className="mt-12 text-[28px] font-extrabold leading-9" style={{ color: COLORS.text }}>
              Choose Eldora Core
            </Text>
            <Text className="mt-4 text-[17px] font-medium leading-7" style={{ color: COLORS.muted }}>
              Select the Core found on this Wi-Fi network to finish pairing.
            </Text>
          </View>
          <ScrollView className="mt-5 flex-1" showsVerticalScrollIndicator={false}>
            {nearbyHubs.map((hub) => (
              <NearbyHubRow
                key={`${hub.deviceKey}-${hub.ipAddress}`}
                hub={hub}
                onPress={() => pairHub(hub)}
              />
            ))}
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="mx-auto w-full max-w-[430px] flex-1 bg-white px-8">
        <View className="h-[76px] flex-row items-center justify-between">
          <Pressable className="h-12 w-12 items-center justify-center" onPress={closeSetup}>
            <X size={36} color={COLORS.text} strokeWidth={2.2} />
          </Pressable>
          <Text className="text-[17px] font-semibold" style={{ color: COLORS.muted }}>
            {copy.mode}
          </Text>
        </View>

        <View className="flex-1 pt-7">
          <Text className="text-[28px] font-extrabold leading-9" style={{ color: COLORS.text }}>
            {copy.title}
          </Text>
          <PairingStepVisual
            setupType={setupType}
            stepIndex={stepIndex}
            onStepPress={setStepIndex}
          />
          <Text className="mt-10 text-[18px] font-extrabold leading-7" style={{ color: COLORS.text }}>
            {copy.steps[stepIndex]}
          </Text>
        </View>

        <View className="pb-9">
          <View className="flex-row items-center">
            {stepIndex > 0 ? (
              <TouchableOpacity
                className="mr-3 h-[50px] w-[112px] items-center justify-center rounded-[14px] border"
                style={{ borderColor: COLORS.line, backgroundColor: "#FFFFFF" }}
                activeOpacity={0.78}
                onPress={() => setStepIndex((current) => Math.max(0, current - 1))}
              >
                <Text
                  className="text-[17px] font-extrabold"
                  style={{ color: COLORS.muted }}
                >
                  Back
                </Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              className="h-[50px] flex-1 items-center justify-center rounded-[14px]"
              style={{ backgroundColor: COLORS.coral }}
              activeOpacity={0.82}
              disabled={discoverLocalHubsMutation.isPending}
              onPress={advanceTutorial}
            >
              <Text
                className="text-[17px] font-extrabold"
                style={{ color: "#FFFFFF" }}
              >
                Next
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
