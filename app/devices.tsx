import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import {
  ActivityIndicator,
  Alert,
  AppState,
  Linking,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import {
  BatteryCharging,
  BatteryMedium,
  Check,
  Clock,
  Router as RouterIcon,
  Users,
  Wifi,
  WifiOff,
  X,
} from "lucide-react-native";
import { MainTabScreen } from "@/components/navigation/MainTabScreen";
import { WifiConfigModal } from "@/components/devices/WifiConfigModal";
import { WifiNetworkRow } from "@/components/devices/WifiNetworkRow";
import {
  useApprovePairingRequestMutation,
  useDiscoverLocalHubsMutation,
  useDevicesScreenQuery,
  usePairLocalDeviceMutation,
  useProvisionLocalWifiMutation,
  useQueueWifiConfigMutation,
  useRejectPairingRequestMutation,
  useScanLocalWifiNetworksMutation,
  useSyncDevicesToHomeSummary,
} from "@/hooks/useDeviceQueries";
import {
  DevicePairingRequest,
  EldoraDevice,
  LocalProvisioningInfo,
  WifiNetwork,
} from "@/types/device.types";
import { formatRelativeTime } from "@/utils/formatters";

type WifiTarget =
  | { kind: "device"; device: EldoraDevice }
  | { kind: "local"; hub: LocalProvisioningInfo };

function signalLabel(rssi: number | null) {
  if (rssi === null) return "Unknown";
  if (rssi >= -55) return "Strong";
  if (rssi >= -70) return "Fair";
  return "Weak";
}

function batteryColor(level: number | null) {
  if (level === null) return "#A0AEC0";
  if (level <= 20) return "#EF4444";
  if (level <= 50) return "#F59E0B";
  return "#22C55E";
}

function formatExpiresIn(isoString: string) {
  const diffMs = new Date(isoString).getTime() - Date.now();
  if (diffMs <= 0) return "Expired";

  const diffMins = Math.ceil(diffMs / 60000);
  if (diffMins < 60) return `${diffMins} mins left`;

  const diffHours = Math.ceil(diffMins / 60);
  return `${diffHours} hours left`;
}

function DeviceRow({
  device,
  onWifiPress,
}: {
  device: EldoraDevice;
  onWifiPress: (device: EldoraDevice) => void;
}) {
  const battery = device.batteryLevel ?? null;
  const lastSeen = device.lastSeen
    ? formatRelativeTime(device.lastSeen)
    : "No heartbeat";

  return (
    <View className="mb-3 rounded-[24px] bg-white p-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-1 flex-row items-center gap-3">
          <View className="h-12 w-12 items-center justify-center rounded-3xl bg-[#EEF7FC]">
            <RouterIcon size={23} color="#7BA7D4" />
          </View>
          <View className="flex-1">
            <View className="flex-row items-center gap-2">
              <View
                className={`h-2.5 w-2.5 rounded-full ${
                  device.isOnline ? "bg-[#22C55E]" : "bg-gray-300"
                }`}
              />
              <Text className="text-[11px] font-bold uppercase text-[#7B8794]">
                {device.isOnline ? "Online" : "Offline"}
              </Text>
            </View>
            <Text
              className="mt-1 text-base font-bold text-[#1F2A37]"
              numberOfLines={1}
            >
              {device.name}
            </Text>
            <Text className="mt-0.5 text-xs text-[#7B8794]" numberOfLines={1}>
              {device.elderName} - {lastSeen}
            </Text>
          </View>
        </View>
        <View className="items-end">
          <View className="flex-row items-center gap-1.5">
            {device.isCharging ? (
              <BatteryCharging size={15} color={batteryColor(battery)} />
            ) : (
              <BatteryMedium size={15} color={batteryColor(battery)} />
            )}
            <Text
              className="text-sm font-bold"
              style={{ color: batteryColor(battery) }}
            >
              {battery ?? "--"}%
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => onWifiPress(device)}
            className="mt-3 flex-row items-center gap-1.5 rounded-2xl bg-[#F6FAFD] px-3 py-2"
            activeOpacity={0.85}
          >
            {device.wifiSsid ? (
              <Wifi size={14} color="#7BA7D4" />
            ) : (
              <WifiOff size={14} color="#A0AEC0" />
            )}
            <Text className="text-[11px] font-bold text-[#5D7184]">WiFi</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="mt-4 flex-row gap-2">
        <View className="flex-1 rounded-2xl bg-[#F8FBFD] p-3">
          <Text className="text-[11px] font-semibold text-[#7B8794]">
            Signal
          </Text>
          <Text className="mt-1 text-sm font-bold text-[#1F2A37]">
            {signalLabel(device.wifiRssi)}
          </Text>
        </View>
        <View className="flex-1 rounded-2xl bg-[#F8FBFD] p-3">
          <Text className="text-[11px] font-semibold text-[#7B8794]">
            Phones
          </Text>
          <Text className="mt-1 text-sm font-bold text-[#1F2A37]">
            {device.caregiverCount}
          </Text>
        </View>
      </View>
    </View>
  );
}

function PairingRequestCard({
  request,
  busy,
  onApprove,
  onReject,
}: {
  request: DevicePairingRequest;
  busy: boolean;
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <View className="mb-3 rounded-[24px] bg-white p-4">
      <View className="flex-row items-start gap-3">
        <View className="h-12 w-12 items-center justify-center rounded-3xl bg-[#FFF4EE]">
          <Users size={22} color="#FF8A7A" />
        </View>
        <View className="flex-1">
          <Text className="text-[15px] font-bold text-[#1F2A37]">
            {request.requester.name}
          </Text>
          <Text className="mt-0.5 text-xs text-[#7B8794]">
            Wants access to {request.device.name}
          </Text>
          <View className="mt-2 flex-row items-center gap-1.5">
            <Clock size={13} color="#7B8794" />
            <Text className="text-[11px] font-semibold text-[#7B8794]">
              {formatExpiresIn(request.expiresAt)}
            </Text>
          </View>
        </View>
      </View>

      <View className="mt-4 flex-row gap-3">
        <TouchableOpacity
          onPress={onReject}
          disabled={busy}
          className="h-12 flex-1 flex-row items-center justify-center gap-2 rounded-2xl bg-[#F6FAFD]"
          activeOpacity={0.82}
        >
          <X size={17} color="#EF4444" />
          <Text className="font-bold text-[#EF4444]">Reject</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onApprove}
          disabled={busy}
          className="h-12 flex-1 flex-row items-center justify-center gap-2 rounded-2xl bg-[#2477F2]"
          activeOpacity={0.9}
        >
          {busy ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Check size={17} color="#FFFFFF" />
              <Text className="font-bold text-white">Approve</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

function DiscoveredHubCard({
  hub,
  onWifiSetup,
}: {
  hub: LocalProvisioningInfo;
  onWifiSetup: () => void;
}) {
  return (
    <View className="mb-3 rounded-[22px] bg-white p-4">
      <View className="flex-row items-center gap-3">
        <View className="h-11 w-11 items-center justify-center rounded-2xl bg-[#EEF7FC]">
          <RouterIcon size={21} color="#7BA7D4" />
        </View>
        <View className="flex-1">
          <Text className="text-[15px] font-bold text-[#1F2A37]">
            Hub
          </Text>
          <Text className="mt-0.5 text-xs text-[#7B8794]">
            {hub.ipAddress} - {hub.hasWifi ? "Home WiFi" : "Setup mode"}
          </Text>
        </View>
      </View>
      <View className="mt-4 flex-row gap-3">
        <TouchableOpacity
          onPress={onWifiSetup}
          className="h-11 flex-1 items-center justify-center rounded-2xl bg-[#F6FAFD]"
          activeOpacity={0.82}
        >
          <Text className="text-[13px] font-bold text-[#1F2A37]">
            WiFi
          </Text>
        </TouchableOpacity>
        <View className="h-11 flex-1 items-center justify-center rounded-2xl bg-[#EAF5FB]">
          <Text className="text-[13px] font-bold text-[#1F2A37]">
            Auto detected
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function DevicesScreen() {
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
  const discoveryRunningRef = useRef(false);
  const completedHubKeysRef = useRef<Set<string>>(new Set());
  const devicesScreenQuery = useDevicesScreenQuery();
  const pairLocalDeviceMutation = usePairLocalDeviceMutation();
  const approvePairingRequestMutation = useApprovePairingRequestMutation();
  const rejectPairingRequestMutation = useRejectPairingRequestMutation();
  const queueWifiConfigMutation = useQueueWifiConfigMutation();
  const provisionLocalWifiMutation = useProvisionLocalWifiMutation();
  const scanLocalWifiNetworksMutation = useScanLocalWifiNetworksMutation();
  const discoverLocalHubsMutation = useDiscoverLocalHubsMutation();

  const activeLocalHub = localHub;
  const devices = devicesScreenQuery.data?.devices ?? [];
  const pairingRequests = devicesScreenQuery.data?.pairingRequests ?? [];
  const isLoading = devicesScreenQuery.isPending && !devicesScreenQuery.data;

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
      setWifiScanError("Connect this phone to the same WiFi as the hub to scan.");
      return;
    }

    setIsScanningWifi(true);
    setWifiScanError(null);

    try {
      const networks = await scanLocalWifiNetworksMutation.mutateAsync(scanIp);
      setWifiNetworks(networks);
      if (networks.length === 0) {
        setWifiScanError("No WiFi networks found near the hub.");
      }
    } catch (err) {
      console.error("[Devices] Failed to scan WiFi networks:", err);
      setWifiScanError("Could not scan WiFi networks from the hub.");
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
        deviceName: "Home Hub",
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
            text1: "Hub connected",
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
            ? "Sign in again, then pair this hub."
            : status === 403
              ? "Restart the hub or wait for its next heartbeat, then try again."
              : status === 404
                ? "Deploy the latest backend, then pair this hub again."
                : "Reconnect this phone to internet, then try again.";

        Toast.show({
          type: "error",
          text1: status ? "Hub found, pairing failed" : "Hub found, backend not reachable",
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
      setDiscoveredHubs(hubs);
      setDiscoveryError(null);

      if (hubs.length === 0) {
        setDiscoveryError("No response from the hub setup address.");
        if (!silent) {
          Toast.show({
            type: "error",
            text1: "No hub found",
            text2: "Make sure this phone is on the same WiFi as the hub.",
          });
        }
        return;
      }

      const firstHub = hubs[0];
      setLocalHub(firstHub);

      if (!silent) {
        Toast.show({
          type: "success",
          text1: "Hub found",
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
        err instanceof Error ? err.message : "Could not reach the hub."
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
    void discoverLocalHubs(true);
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        void discoverLocalHubs(true);
      }
    });

    return () => subscription.remove();
  }, []);

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
    void scanWifiNetworks(device.localIp);
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
            : "WiFi received by hub",
        text2:
          wifiTarget.kind === "device" && wifiTarget.device.isOnline
            ? "The hub will pick it up from the command queue."
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
        text2: `${request.requester.name} can now monitor this hub.`,
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
      ? "Hub"
      : wifiTarget?.device.name ?? "Hub";
  const wifiTargetIp =
    wifiTarget?.kind === "local"
      ? wifiTarget.hub.ipAddress
      : wifiTarget?.device.localIp ?? null;
  const isAutoPairing = isDiscovering || isPairing;
  const hubTitle = isAutoPairing
    ? "Looking for hub"
    : activeLocalHub
      ? "Hub detected"
      : "No hub found";
  const hubDescription = isAutoPairing
    ? "Checking the current WiFi network for a nearby hub."
    : activeLocalHub
      ? "This phone can communicate with the hub on the current network."
      : discoveryError
        ? discoveryError
      : "Pull down to check the current WiFi network again.";
  const hubMeta = activeLocalHub
    ? `${activeLocalHub.productName} - ${activeLocalHub.ipAddress}`
    : null;

  return (
    <MainTabScreen active="devices">
        <ScrollView
          className="flex-1"
          contentContainerClassName="pb-8"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#FF8A7A"
            />
          }
        >
          <View className="px-5 pt-5">
            <View>
              <Text className="text-[26px] font-bold text-[#1F2A37]">
                Hub
              </Text>
              <Text className="mt-1 text-[13px] font-semibold text-[#7B8794]">
                Pair and manage your home device.
              </Text>
            </View>

            <View
              className="mt-5 rounded-[24px] border border-[#EEF3F7] bg-white p-4"
              style={{
                shadowColor: "#1F2A37",
                shadowOpacity: 0.05,
                shadowRadius: 16,
                shadowOffset: { width: 0, height: 8 },
                elevation: 2,
              }}
            >
              <View className="flex-row items-center">
                <View className="flex-1 pr-4">
                  <Text className="text-[17px] font-bold text-[#1F2A37]">
                    Pair nearby hub
                  </Text>
                  <Text className="mt-1 text-[13px] leading-5 text-[#7B8794]">
                    {hubDescription}
                  </Text>
                </View>
                <View className="h-14 w-14 items-center justify-center rounded-[20px] bg-[#EEF7FC]">
                  {isAutoPairing ? (
                    <ActivityIndicator color="#2477F2" />
                  ) : activeLocalHub ? (
                    <Wifi size={25} color="#22C55E" />
                  ) : (
                    <WifiOff size={25} color="#7B8794" />
                  )}
                </View>
              </View>

              <View className="mt-4 rounded-2xl bg-[#F8FBFD] px-4 py-3">
                <Text className="text-[11px] font-bold uppercase text-[#7B8794]">
                  Status
                </Text>
                <Text className="mt-1 text-[15px] font-bold text-[#1F2A37]">
                  {hubTitle}
                </Text>
                {hubMeta ? (
                  <Text className="mt-1 text-[12px] font-semibold text-[#7B8794]">
                    {hubMeta}
                  </Text>
                ) : null}
              </View>

              {activeLocalHub ? (
                <View className="mt-4 rounded-2xl bg-[#F8FBFD] px-4 pb-1 pt-4">
                  <View className="mb-2 flex-row items-center justify-between">
                    <View>
                      <Text className="text-[11px] font-bold uppercase text-[#7B8794]">
                        Available WiFi
                      </Text>
                      <Text className="mt-1 text-[13px] font-semibold text-[#1F2A37]">
                        Choose the home network for this hub.
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => scanWifiNetworks(activeLocalHub.ipAddress)}
                      disabled={isScanningWifi}
                      className="rounded-xl bg-white px-3 py-2"
                      activeOpacity={0.82}
                    >
                      <Text className="text-[12px] font-bold text-[#2477F2]">
                        {isScanningWifi ? "Scanning" : "Rescan"}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {isScanningWifi ? (
                    <View className="flex-row items-center border-t border-[#EEF3F7] py-3">
                      <ActivityIndicator color="#2477F2" />
                      <Text className="ml-3 text-[13px] font-semibold text-[#7B8794]">
                        Scanning networks near the hub...
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
                      <Text className="text-[13px] font-semibold text-[#7B8794]">
                        {wifiScanError ?? "No networks scanned yet."}
                      </Text>
                    </View>
                  )}
                </View>
              ) : null}

              <TouchableOpacity
                onPress={openWifiSettings}
                className="mt-4 h-12 items-center justify-center rounded-2xl bg-[#F6FAFD]"
                activeOpacity={0.85}
              >
                <Text className="text-[13px] font-bold text-[#1F2A37]">
                  Open WiFi settings
                </Text>
              </TouchableOpacity>
            </View>

            {discoveredHubs.length > 1 ? (
              <>
                <Text className="mb-3 mt-6 text-base font-bold text-[#1F2A37]">
                  Nearby Eldora hubs
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

            <View className="mt-5 flex-row gap-3">
              <View className="flex-1 rounded-[20px] bg-[#F8FBFD] p-4">
                <Text className="text-[24px] font-bold text-[#1F2A37]">
                  {onlineCount}
                </Text>
                <Text className="mt-1 text-[12px] font-semibold text-[#7B8794]">
                  Online
                </Text>
              </View>
              <View className="flex-1 rounded-[20px] bg-[#F8FBFD] p-4">
                <Text className="text-[24px] font-bold text-[#1F2A37]">
                  {devices.length}
                </Text>
                <Text className="mt-1 text-[12px] font-semibold text-[#7B8794]">
                  Paired hubs
                </Text>
              </View>
            </View>

            {pairingRequests.length > 0 ? (
              <>
                <Text className="mb-3 mt-6 text-base font-bold text-[#1F2A37]">
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

            <Text className="mb-3 mt-6 text-base font-bold text-[#1F2A37]">
              Connected hubs
            </Text>
            {isLoading ? null : devices.length === 0 ? (
              <View className="flex-row items-center rounded-[22px] bg-[#F8FBFD] p-4">
                <View className="mr-3 h-12 w-12 items-center justify-center rounded-2xl bg-white">
                  <RouterIcon size={25} color="#7BA7D4" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-bold text-[#1F2A37]">
                    No hub connected
                  </Text>
                  <Text className="mt-1 text-[13px] leading-5 text-[#7B8794]">
                    Pull down to search again.
                  </Text>
                </View>
              </View>
            ) : (
              devices.map((device) => (
                <DeviceRow
                  key={device.id}
                  device={device}
                  onWifiPress={openDeviceWifiModal}
                />
              ))
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
