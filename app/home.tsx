import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import {
  ActivityIndicator,
  Alert,
  AppState,
  Linking,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { router } from "expo-router";
import {
  ChevronDown,
  ListChecks,
  MoreHorizontal,
  Plus,
  Router as RouterIcon,
  Settings2,
  ShieldCheck,
  Wifi,
  WifiOff,
} from "lucide-react-native";
import { DiscoveredHubCard } from "@/components/cards/DiscoveredHubCard";
import { AddDeviceMenu } from "@/components/devices/AddDeviceMenu";
import { DeonDeviceRow } from "@/components/home/DeonDeviceRow";
import { HomeSelectorMenu } from "@/components/home/HomeSelectorMenu";
import { MainTabScreen } from "@/components/navigation/MainTabScreen";
import { PairingRequestCard } from "@/components/home/PairingRequestCard";
import { WifiConfigModal } from "@/components/devices/WifiConfigModal";
import { WifiNetworkRow } from "@/components/devices/WifiNetworkRow";
import {
  useApprovePairingRequestMutation,
  useDiscoverLocalHubsMutation,
  useDevicesScreenQuery,
  usePairLocalDeviceMutation,
  useProvisionLocalWifiMutation,
  useQueueWifiConfigMutation,
  useRoomCategoriesQuery,
  useRejectPairingRequestMutation,
  useScanLocalWifiNetworksMutation,
  useSyncDevicesToHomeSummary,
} from "@/hooks/useDeviceQueries";
import { useHomesQuery } from "@/hooks/useHomeManagementQueries";
import {
  DevicePairingRequest,
  EldoraDevice,
  LocalProvisioningInfo,
  WifiNetwork,
} from "@/types/device.types";
import { COLORS } from "@/constants/theme";
import { deviceStatusText } from "@/utils/device.utils";
import { formatRelativeTime } from "@/utils/formatters";

type WifiTarget =
  | { kind: "device"; device: EldoraDevice }
  | { kind: "local"; hub: LocalProvisioningInfo };

function isAlreadyPairedHub(hub: LocalProvisioningInfo, devices: EldoraDevice[]) {
  return devices.some((device) => device.deviceId === hub.deviceKey);
}

export default function HomeScreen() {
  const [discoveredHubs, setDiscoveredHubs] = useState<LocalProvisioningInfo[]>([]);
  const [localHub, setLocalHub] = useState<LocalProvisioningInfo | null>(null);
  const [wifiNetworks, setWifiNetworks] = useState<WifiNetwork[]>([]);
  const [isScanningWifi, setIsScanningWifi] = useState(false);
  const [wifiScanError, setWifiScanError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [isPairing, setIsPairing] = useState(false);
  const [discoveryError, setDiscoveryError] = useState<string | null>(null);
  const [busyRequestId, setBusyRequestId] = useState<string | null>(null);
  const [wifiTarget, setWifiTarget] = useState<WifiTarget | null>(null);
  const [showWifiPickerInModal, setShowWifiPickerInModal] = useState(false);
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSendingWifi, setIsSendingWifi] = useState(false);
  const [showHomeMenu, setShowHomeMenu] = useState(false);
  const [showDeviceMenu, setShowDeviceMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [selectedRoomSlug, setSelectedRoomSlug] = useState("all");
  const discoveryRunningRef = useRef(false);
  const autoDiscoveryAttemptedRef = useRef(false);
  const completedHubKeysRef = useRef<Set<string>>(new Set());
  const devicesScreenQuery = useDevicesScreenQuery();
  const pairLocalDeviceMutation = usePairLocalDeviceMutation();
  const approvePairingRequestMutation = useApprovePairingRequestMutation();
  const rejectPairingRequestMutation = useRejectPairingRequestMutation();
  const queueWifiConfigMutation = useQueueWifiConfigMutation();
  const provisionLocalWifiMutation = useProvisionLocalWifiMutation();
  const scanLocalWifiNetworksMutation = useScanLocalWifiNetworksMutation();
  const discoverLocalHubsMutation = useDiscoverLocalHubsMutation();
  const homesQuery = useHomesQuery();
  const selectedHome = homesQuery.data?.[0];
  const selectedHomeName = selectedHome?.name ?? "...";
  const hasSelectedHome = Boolean(selectedHome);
  const roomCategoriesQuery = useRoomCategoriesQuery(selectedHome?.id);

  const activeLocalHub = localHub;
  const devices = devicesScreenQuery.data?.devices ?? [];
  const pairingRequests = devicesScreenQuery.data?.pairingRequests ?? [];
  const isLoading = devicesScreenQuery.isPending && !devicesScreenQuery.data;
  const managedRoomCategories = (roomCategoriesQuery.data ?? []).filter(
    (room) => room.slug !== "all"
  );
  const roomTabs = [
    { id: "all", name: "All Devices", slug: "all", sortOrder: 0, isDefault: true },
    ...managedRoomCategories,
  ];

  const onlineCount = useMemo(
    () => devices.filter((device) => device.isOnline).length,
    [devices]
  );
  useSyncDevicesToHomeSummary(devicesScreenQuery.data);

  const refetchDeviceData = async () => {
    const result = await devicesScreenQuery.refetch();

    if (result.error) {
      console.error("[Devices] Failed to load devices:", result.error);
      Toast.show({
        type: "error",
        text1: "Device data failed to load",
        text2: "Please try again in a moment.",
      });
    }
  };

  const scanWifiNetworks = async (ipAddress?: string | null) => {
    const scanIp = ipAddress ?? activeLocalHub?.ipAddress;

    if (!scanIp) {
      setWifiNetworks([]);
      setWifiScanError("Connect this phone to the same WiFi as DoraBot.");
      return;
    }

    setIsScanningWifi(true);
    setWifiScanError(null);

    try {
      const networks = await scanLocalWifiNetworksMutation.mutateAsync(scanIp);
      setWifiNetworks(networks);
      if (networks.length === 0) {
        setWifiScanError("No WiFi networks found near DoraBot.");
      }
    } catch (err) {
      console.error("[Devices] Failed to scan WiFi networks:", err);
      setWifiScanError("Could not scan WiFi networks from DoraBot.");
    } finally {
      setIsScanningWifi(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetchDeviceData(),
        discoverLocalHubs(true),
        activeLocalHub ? scanWifiNetworks(activeLocalHub.ipAddress) : Promise.resolve(),
      ]);
    } finally {
      setIsRefreshing(false);
    }
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
        text2: "Open WiFi settings from your phone and reconnect manually.",
      });
    }
  };

  const pairLocalHub = async (
    hub: LocalProvisioningInfo,
    silent: boolean = false
  ) => {
    if (
      silent &&
      completedHubKeysRef.current.has(hub.deviceKey)
    ) {
      return;
    }

    setIsPairing(true);
    setLocalHub(hub);

    try {
      const result = await pairLocalDeviceMutation.mutateAsync({
        deviceKey: hub.deviceKey,
        pairingToken: hub.pairingToken,
        localIp: hub.ipAddress,
        elderName: "Eldora User",
        deviceName: "DoraBot",
        batteryLevel: hub.batteryLevel ?? undefined,
        isCharging: hub.isCharging,
        wifiSsid: hub.wifiSsid ?? undefined,
        wifiRssi: hub.wifiRssi ?? undefined,
        firmwareVersion: hub.firmwareVersion,
      });

      if (result.kind === "pending") {
        completedHubKeysRef.current.add(hub.deviceKey);

        if (!silent) {
          Toast.show({
            type: "success",
            text1: "Request sent",
            text2: "An existing caregiver needs to approve this phone.",
          });
        }
      } else {
        completedHubKeysRef.current.add(hub.deviceKey);

        if (!silent) {
          Toast.show({
            type: "success",
            text1: "DoraBot connected",
            text2: `${result.device.name} is now linked to this phone.`,
          });
        }
      }

      await refetchDeviceData();
    } catch (err) {
      console.error("[Devices] Failed to pair local hub:", err);

      if (!silent) {
        const status = axios.isAxiosError(err) ? err.response?.status : null;
        const text2 =
          status === 401
            ? "Sign in again, then pair this device."
            : status === 403
              ? "Restart DoraBot or wait for its next heartbeat, then try again."
              : status === 404
                ? "Deploy the latest backend, then pair this device again."
                : "Reconnect this phone to internet, then try again.";

        Toast.show({
          type: "error",
          text1: status ? "DoraBot found, pairing failed" : "DoraBot found, backend not reachable",
          text2,
        });
      }
    } finally {
      setIsPairing(false);
    }
  };

  const discoverLocalHubs = async (silent: boolean = false) => {
    if (discoveryRunningRef.current) return;

    discoveryRunningRef.current = true;
    setIsDiscovering(true);

    try {
      const hubs = await discoverLocalHubsMutation.mutateAsync();
      const unpairedHubs = hubs.filter((hub) => !isAlreadyPairedHub(hub, devices));
      setDiscoveredHubs(unpairedHubs);
      setDiscoveryError(null);

      if (unpairedHubs.length === 0) {
        setDiscoveryError(hubs.length > 0 ? "No new DoraBot found." : "No response from the DoraBot setup address.");
        if (!silent) {
          Toast.show({
            type: "error",
            text1: hubs.length > 0 ? "No new DoraBot found" : "No DoraBot found",
            text2: hubs.length > 0 ? "Connected devices are hidden from search results." : "Make sure this phone is on the same WiFi as DoraBot.",
          });
        }
        return;
      }

      const firstHub = unpairedHubs[0];
      setLocalHub(firstHub);

      if (!silent) {
        Toast.show({
          type: "success",
          text1: "DoraBot found",
          text2: firstHub.hasWifi
            ? firstHub.ipAddress
            : "Waiting for WiFi connection",
        });
      }

      if (firstHub.hasWifi) {
        await pairLocalHub(firstHub, silent);
      }
    } catch (err) {
      console.error("[Devices] Failed to discover local hubs:", err);
      setDiscoveryError(
        err instanceof Error ? err.message : "Could not reach DoraBot."
      );
      if (!silent) {
        Toast.show({
          type: "error",
          text1: "Discovery failed",
          text2: "Please try again.",
        });
      }
    } finally {
      discoveryRunningRef.current = false;
      setIsDiscovering(false);
    }
  };

  useEffect(() => {
    if (
      devicesScreenQuery.isPending ||
      autoDiscoveryAttemptedRef.current
    ) {
      return;
    }

    autoDiscoveryAttemptedRef.current = true;
    if (devices.length === 0) {
      void discoverLocalHubs(true);
    }
  }, [devices.length, devicesScreenQuery.isPending]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active" && devices.length === 0) {
        void discoverLocalHubs(true);
      }
    });

    return () => subscription.remove();
  }, [devices.length]);

  useEffect(() => {
    if (!activeLocalHub) {
      setWifiNetworks([]);
      setWifiScanError(null);
      return;
    }

    void scanWifiNetworks(activeLocalHub.ipAddress);
  }, [activeLocalHub?.ipAddress]);

  const openDeviceWifiModal = (device: EldoraDevice) => {
    setWifiTarget({ kind: "device", device });
    setShowWifiPickerInModal(true);
    setSsid("");
    setPassword("");
    setWifiNetworks([]);
    setWifiScanError(null);
    void scanWifiNetworks(device.localIp ?? activeLocalHub?.ipAddress);
  };

  const openLocalWifiModal = (
    hub: LocalProvisioningInfo,
    selectedSsid?: string
  ) => {
    setWifiTarget({ kind: "local", hub });
    setShowWifiPickerInModal(!selectedSsid);
    setSsid(selectedSsid ?? hub.wifiSsid ?? "");
    setPassword("");
    setWifiScanError(null);
    if (!selectedSsid) void scanWifiNetworks(hub.ipAddress);
  };

  const closeWifiModal = () => {
    setWifiTarget(null);
    setShowWifiPickerInModal(false);
    setSsid("");
    setPassword("");
    setShowPassword(false);
  };

  const handleWifiSubmit = async () => {
    if (!wifiTarget || !ssid.trim()) {
      Alert.alert("WiFi not selected", "Choose a WiFi network from the list.");
      return;
    }

    setIsSendingWifi(true);

    try {
      const payload = { ssid: ssid.trim(), password };

      if (wifiTarget.kind === "device" && wifiTarget.device.isOnline) {
        await queueWifiConfigMutation.mutateAsync({
          deviceId: wifiTarget.device.id,
          payload,
        });
      } else {
        const ipAddress =
          wifiTarget.kind === "local"
            ? wifiTarget.hub.ipAddress
            : wifiTarget.device.localIp ?? localHub?.ipAddress;
        await provisionLocalWifiMutation.mutateAsync({ payload, ipAddress });
      }

      closeWifiModal();
      Toast.show({
        type: "success",
        text1:
          wifiTarget.kind === "device" && wifiTarget.device.isOnline
            ? "WiFi updated"
            : "WiFi received by DoraBot",
        text2:
          wifiTarget.kind === "device" && wifiTarget.device.isOnline
            ? "DoraBot will pick it up from the command queue."
            : "Reconnect this phone to internet, then finish pairing.",
      });
    } catch (err) {
      console.error("[Devices] Failed to update WiFi:", err);
      Toast.show({
        type: "error",
        text1: "WiFi update failed",
        text2: "Please check the network name and password.",
      });
    } finally {
      setIsSendingWifi(false);
    }
  };

  const approveRequest = async (request: DevicePairingRequest) => {
    setBusyRequestId(request.id);
    try {
      await approvePairingRequestMutation.mutateAsync(request.id);
      await refetchDeviceData();
      Toast.show({
        type: "success",
        text1: "Phone approved",
        text2: `${request.requester.name} can now monitor this device.`,
      });
    } catch (err) {
      console.error("[Devices] Failed to approve request:", err);
      Toast.show({
        type: "error",
        text1: "Approval failed",
        text2: "Please try again.",
      });
    } finally {
      setBusyRequestId(null);
    }
  };

  const rejectRequest = async (request: DevicePairingRequest) => {
    setBusyRequestId(request.id);
    try {
      await rejectPairingRequestMutation.mutateAsync(request.id);
      await refetchDeviceData();
      Toast.show({
        type: "success",
        text1: "Request rejected",
      });
    } catch (err) {
      console.error("[Devices] Failed to reject request:", err);
      Toast.show({
        type: "error",
        text1: "Reject failed",
        text2: "Please try again.",
      });
    } finally {
      setBusyRequestId(null);
    }
  };

  const wifiTitle =
    wifiTarget?.kind === "local"
      ? "DoraBot"
      : wifiTarget?.device.name ?? "DoraBot";
  const wifiTargetIp =
    wifiTarget?.kind === "local"
      ? wifiTarget.hub.ipAddress
      : wifiTarget?.device.localIp ?? activeLocalHub?.ipAddress ?? null;
  const hasPairedHubs = devices.length > 0;
  const isAutoPairing = isDiscovering || isPairing;
  const hubTitle = isAutoPairing
    ? "Looking for DoraBot"
    : activeLocalHub
      ? "DoraBot detected"
      : hasPairedHubs
        ? "DoraBot connected"
      : "No DoraBot found";
  const hubDescription = isAutoPairing
    ? "Checking the current WiFi network for a nearby DoraBot."
    : activeLocalHub
      ? "This phone can communicate with DoraBot on the current network."
      : hasPairedHubs
        ? "Manage connected devices below or pull down to search for another DoraBot."
      : discoveryError
        ? discoveryError
      : "Pull down to check the current WiFi network again.";
  const hubMeta = activeLocalHub
    ? `${activeLocalHub.productName} - ${activeLocalHub.ipAddress}`
    : hasPairedHubs
      ? `${devices.length} paired device${devices.length === 1 ? "" : "s"}`
    : null;
  const dorabotDevice =
    devices.find((device) => device.name.toLowerCase().includes("dorabot")) ??
    devices.find((device) => !device.name.toLowerCase().includes("dorashield")) ??
    devices[0] ??
    null;
  const dorashieldDevice =
    devices.find((device) => {
      const name = `${device.name} ${device.deviceId}`.toLowerCase();
      return name.includes("dorashield") || name.includes("shield") || name.includes("vest");
    }) ??
    devices.find((device) => device.id !== dorabotDevice?.id) ??
    null;
  const dorabotOnline = dorabotDevice?.isOnline ?? !!activeLocalHub;
  const dorabotLastSeen = dorabotDevice?.lastSeen
    ? formatRelativeTime(dorabotDevice.lastSeen)
    : activeLocalHub
      ? "Detected nearby"
      : "No heartbeat";
  const dorashieldLastSeen = dorashieldDevice?.lastSeen
    ? formatRelativeTime(dorashieldDevice.lastSeen)
    : "Not paired yet";
  const displayDevices = devices.filter((device) => {
    if (selectedRoomSlug === "all") return true;
    const selectedRoom = managedRoomCategories.find(
      (room) => room.slug === selectedRoomSlug
    );
    const haystack = [
      device.name,
      device.elderName,
      device.wifiSsid,
      device.deviceId,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return selectedRoom
      ? device.roomCategory?.slug === selectedRoom.slug ||
          haystack.includes(selectedRoom.name.toLowerCase()) ||
          haystack.includes(selectedRoom.slug.replace(/-/g, " "))
      : false;
  }).map((device) => {
    const searchableName = `${device.name} ${device.deviceId}`.toLowerCase();
    const isDoraShield =
      searchableName.includes("dorashield") ||
      searchableName.includes("shield") ||
      searchableName.includes("vest");

    return {
      device,
      title: isDoraShield ? "DoraShield" : device.name,
      room: device.wifiSsid
        ? `${device.elderName} | ${device.wifiSsid}`
        : `${device.elderName} | ${device.lastSeen ? formatRelativeTime(device.lastSeen) : "No heartbeat"}`,
      Icon: isDoraShield ? ShieldCheck : RouterIcon,
      accent: COLORS.coral,
    };
  });

  return (
    <MainTabScreen active="home">
        <ScrollView
          className="flex-1 bg-white"
          contentContainerClassName="pb-8"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          tintColor="#D95545"
            />
          }
        >
          <View className="bg-white px-5 pt-5">
            <View className="flex-row items-center justify-between">
                <TouchableOpacity
                className="flex-row items-center"
                accessibilityRole="button"
                accessibilityLabel="Select home"
                accessibilityHint="Open the home selector"
                onPress={() => {
                  setShowDeviceMenu(false);
                  setShowMoreMenu(false);
                  setShowHomeMenu(true);
                }}
                activeOpacity={0.75}
              >
                <Text className="text-[20px] font-semibold leading-7 text-[#5F6B7A]">
                  {selectedHomeName}
                </Text>
                <ChevronDown size={18} color="#B8B0A8" />
              </TouchableOpacity>
              <View className="flex-row items-center">
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel="Open add menu"
                  accessibilityHint="Add a device or create a scene"
                  onPress={() => {
                    setShowMoreMenu(false);
                    setShowDeviceMenu((value) => !value);
                  }}
                  className="h-10 w-10 items-center justify-center rounded-full bg-[#D95545]"
                  activeOpacity={0.82}
                >
                  <Plus size={25} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>

            <HomeSelectorMenu
              visible={showHomeMenu}
              selectedHomeName={selectedHomeName}
              hasSelectedHome={hasSelectedHome}
              onClose={() => setShowHomeMenu(false)}
            />

            <AddDeviceMenu
              visible={showDeviceMenu}
              showCreateScene
              onClose={() => setShowDeviceMenu(false)}
            />

            <View className="mt-7 overflow-hidden rounded-[22px] bg-[#F6F1EC] px-7 py-7">
              <View className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/40" />
              <View className="absolute right-16 top-5 h-36 w-36 rounded-full bg-white/30" />
              <View className="flex-row items-center">
                <View className="mr-5 h-[52px] w-[52px] items-center justify-center rounded-full bg-white">
                  {isAutoPairing ? (
                    <ActivityIndicator color="#D95545" />
                  ) : dorabotOnline ? (
                    <Wifi size={26} color="#D95545" />
                  ) : (
                    <WifiOff size={26} color="#B8B0A8" />
                  )}
                </View>
                <Text className="text-[26px] font-extrabold leading-8 text-[#17202A]">
                  {onlineCount}
                </Text>
              </View>
              <View className="mt-7 flex-row justify-between">
                <View className="max-w-[30%]">
                  <Text className="text-[15px] font-extrabold text-[#17202A]">
                    {dorabotOnline ? "Ready" : "Setup"}
                  </Text>
                  <Text className="text-[12px] font-semibold text-[#5F6B7A]">
                    DoraBot status
                  </Text>
                </View>
                <View className="max-w-[30%]">
                  <Text className="text-[15px] font-extrabold text-[#17202A]">
                    {devices.length || "-"}
                  </Text>
                  <Text className="text-[12px] font-semibold text-[#5F6B7A]">
                    Devices
                  </Text>
                </View>
                <View className="max-w-[34%]">
                  <Text className="text-[15px] font-extrabold text-[#17202A]" numberOfLines={1}>
                    {activeLocalHub?.wifiSsid ?? dorabotDevice?.wifiSsid ?? "WiFi"}
                  </Text>
                  <Text className="text-[12px] font-semibold text-[#5F6B7A]">
                    Network
                  </Text>
                </View>
              </View>
            </View>

            <View className="mt-8 flex-row items-center">
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="flex-1"
              >
                {roomTabs.map((room) => {
                  const active = room.slug === selectedRoomSlug;
                  return (
                    <TouchableOpacity
                      key={room.slug}
                      onPress={() => setSelectedRoomSlug(room.slug)}
                      className="mr-8"
                      activeOpacity={0.76}
                      accessibilityRole="button"
                      accessibilityLabel={`${room.name} room filter`}
                      accessibilityState={{ selected: active }}
                    >
                      <Text
                        className={`text-[16px] leading-6 ${
                          active
                            ? "font-extrabold text-[#17202A]"
                            : "font-semibold text-[#5F6B7A]"
                        }`}
                        numberOfLines={1}
                      >
                        {room.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
              {hasSelectedHome ? (
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel="Open home options"
                  onPress={() => {
                    setShowDeviceMenu(false);
                    setShowMoreMenu((value) => !value);
                  }}
                  className="ml-2 h-8 w-9 items-center justify-center"
                  activeOpacity={0.75}
                >
                  <MoreHorizontal size={24} color="#5F6B7A" />
                </TouchableOpacity>
              ) : null}
            </View>

            {showMoreMenu && hasSelectedHome ? (
              <Modal
                transparent
                animationType="fade"
                visible={showMoreMenu}
                accessibilityViewIsModal
                onRequestClose={() => setShowMoreMenu(false)}
              >
                <Pressable
                  className="flex-1"
                  onPress={() => setShowMoreMenu(false)}
                >
                  <View className="mx-auto w-full max-w-[430px] flex-1">
                    <Pressable
                      className="absolute right-5 top-[332px] w-[260px] rounded-[18px] bg-white py-2"
                      accessibilityRole="menu"
                      accessibilityLabel="Home options"
                      onPress={(event) => event.stopPropagation()}
                      style={{
                        shadowColor: "#17202A",
                        shadowOpacity: 0.14,
                        shadowRadius: 20,
                        shadowOffset: { width: 0, height: 10 },
                        elevation: 9,
                      }}
                    >
                      {[
                        {
                          label: "Device Management",
                          Icon: ListChecks,
                          onPress: () => {
                            setShowMoreMenu(false);
                            router.push("/device-management" as never);
                          },
                        },
                        {
                          label: "Room Management",
                          Icon: Settings2,
                          onPress: () => {
                            setShowMoreMenu(false);
                            router.push("/room-management" as never);
                          },
                        },
                      ].map(({ label, Icon, onPress }, index, items) => (
                        <React.Fragment key={label}>
                          <TouchableOpacity
                            className="flex-row items-center gap-5 px-6 py-4"
                            activeOpacity={0.78}
                            accessibilityRole="menuitem"
                            accessibilityLabel={label}
                            onPress={onPress}
                          >
                            <Icon size={24} color="#17202A" />
                            <Text className="text-[16px] font-extrabold text-[#17202A]">
                              {label}
                            </Text>
                          </TouchableOpacity>
                          {index < items.length - 1 ? (
                            <View className="ml-[72px] h-px bg-[#E7E1DA]" />
                          ) : null}
                        </React.Fragment>
                      ))}
                    </Pressable>
                  </View>
                </Pressable>
              </Modal>
            ) : null}

              {activeLocalHub ? (
                <View className="mt-5 rounded-[26px] bg-white px-4 pb-1 pt-4">
                  <View className="mb-2 flex-row items-center justify-between">
                    <View>
                      <Text className="text-[11px] font-bold uppercase text-[#5F6B7A]">
                        Available WiFi
                      </Text>
                      <Text className="mt-1 text-[13px] font-semibold text-[#17202A]">
                        Choose the home network for DoraBot.
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => scanWifiNetworks(activeLocalHub.ipAddress)}
                      disabled={isScanningWifi}
                      className="rounded-xl bg-[#F6F1EC] px-3 py-2"
                      activeOpacity={0.82}
                      accessibilityRole="button"
                      accessibilityLabel="Refresh WiFi networks"
                      accessibilityState={{ disabled: isScanningWifi, busy: isScanningWifi }}
                    >
                      <Text className="text-[12px] font-bold text-[#D95545]">
                        {isScanningWifi ? "Checking" : "Refresh"}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {isScanningWifi ? (
                    <View className="flex-row items-center border-t border-[#EEF3F7] py-3">
                      <ActivityIndicator color="#D95545" />
                      <Text className="ml-3 text-[13px] font-semibold text-[#5F6B7A]">
                        Checking networks near DoraBot...
                      </Text>
                    </View>
                  ) : wifiNetworks.length > 0 ? (
                    wifiNetworks.map((network) => (
                      <WifiNetworkRow
                        key={`${network.ssid}-${network.channel ?? "auto"}`}
                        network={network}
                        onPress={() =>
                          openLocalWifiModal(activeLocalHub, network.ssid)
                        }
                      />
                    ))
                  ) : (
                    <View className="border-t border-[#EEF3F7] py-3">
                      <Text className="text-[13px] font-semibold text-[#5F6B7A]">
                        {wifiScanError ?? "No networks loaded yet."}
                      </Text>
                    </View>
                  )}
                </View>
              ) : null}

            {discoveredHubs.length > 1 ? (
              <>
                <Text className="mb-3 mt-6 text-base font-bold text-[#17202A]">
                  Nearby Eldora devices
                </Text>
                {discoveredHubs.map((hub) => (
                  <DiscoveredHubCard
                    key={`${hub.deviceKey}-${hub.ipAddress}`}
                    hub={hub}
                    onWifiSetup={() => openLocalWifiModal(hub)}
                  />
                ))}
              </>
            ) : null}

            {pairingRequests.length > 0 ? (
              <>
                <Text className="mb-3 mt-6 text-base font-bold text-[#17202A]">
                  Pairing requests
                </Text>
                {pairingRequests.map((request) => (
                  <PairingRequestCard
                    key={request.id}
                    request={request}
                    busy={busyRequestId === request.id}
                    onApprove={() => approveRequest(request)}
                    onReject={() => rejectRequest(request)}
                  />
                ))}
              </>
            ) : null}

            <View className="mt-10" />
            {isLoading ? (
              <View className="flex-row items-center px-8 py-7">
                <ActivityIndicator color="#D95545" />
                <Text className="ml-4 text-[16px] font-semibold text-[#5F6B7A]">
                  Loading connected devices...
                </Text>
              </View>
            ) : (
              displayDevices.length > 0 ? (
                displayDevices.map(({ device, title, room, Icon, accent }) => (
                  <DeonDeviceRow
                    key={device.id}
                    title={title}
                    room={room}
                    status={deviceStatusText(device.isOnline)}
                    Icon={Icon}
                    accent={accent}
                    onPress={() =>
                      router.push(`/device-detail?id=${device.id}` as never)
                    }
                  />
                ))
              ) : (
                <View className="items-center px-8 py-14">
                  <RouterIcon size={52} color="#8E97A3" strokeWidth={1.8} />
                  <Text className="mt-6 text-center text-[18px] font-extrabold leading-6 text-[#5F6B7A]">
                    No devices yet
                  </Text>
                  <Text className="mt-3 text-center text-[15px] font-semibold leading-6 text-[#5F6B7A]">
                    Tap the plus button to pair a device.
                  </Text>
                </View>
              )
            )}
          </View>
        </ScrollView>

      <WifiConfigModal
        visible={!!wifiTarget}
        title={wifiTitle}
        targetIp={wifiTargetIp}
        showWifiPicker={showWifiPickerInModal}
        wifiNetworks={wifiNetworks}
        isScanningWifi={isScanningWifi}
        wifiScanError={wifiScanError}
        ssid={ssid}
        password={password}
        showPassword={showPassword}
        isSendingWifi={isSendingWifi}
        onClose={closeWifiModal}
        onRescan={() => scanWifiNetworks(wifiTargetIp)}
        onSelectNetwork={setSsid}
        onPasswordChange={setPassword}
        onTogglePassword={() => setShowPassword((value) => !value)}
        onSubmit={handleWifiSubmit}
      />
    </MainTabScreen>
  );
}
