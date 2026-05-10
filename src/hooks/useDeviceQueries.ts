import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { devicesApi, DevicesScreenData } from "@/api/devicesApi";
import { queryKeys } from "@/lib/queryClient";
import {
  EldoraDevice,
  LocalPairDevicePayload,
  WifiConfigPayload,
} from "@/types/device.types";
import { HomeSummary } from "@/types/home.types";

function toHomeSummary(devices: EldoraDevice[]): HomeSummary {
  return {
    devices: devices.map((device) => ({
      id: device.id,
      deviceId: device.deviceId,
      name: device.name,
      isOnline: device.isOnline,
      lastSeen: device.lastSeen,
      batteryLevel: device.batteryLevel,
      isCharging: device.isCharging,
      wifiSsid: device.wifiSsid,
      wifiRssi: device.wifiRssi,
      firmwareVersion: device.firmwareVersion,
    })),
  };
}

export function useDevicesScreenQuery() {
  return useQuery({
    queryKey: queryKeys.devices.screen,
    queryFn: devicesApi.getScreenData,
  });
}

export function useSyncDevicesToHomeSummary(data?: DevicesScreenData) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!data) return;

    queryClient.setQueryData<HomeSummary>(
      queryKeys.home.summary,
      toHomeSummary(data.devices)
    );
  }, [data, queryClient]);
}

export function usePairLocalDeviceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LocalPairDevicePayload) =>
      devicesApi.pairLocalDevice(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.devices.screen });
    },
  });
}

export function useApprovePairingRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: devicesApi.approvePairingRequest,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.devices.screen });
    },
  });
}

export function useRejectPairingRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: devicesApi.rejectPairingRequest,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.devices.screen });
    },
  });
}

export function useQueueWifiConfigMutation() {
  return useMutation({
    mutationFn: ({
      deviceId,
      payload,
    }: {
      deviceId: string;
      payload: WifiConfigPayload;
    }) => devicesApi.queueWifiConfig(deviceId, payload),
  });
}

export function useProvisionLocalWifiMutation() {
  return useMutation({
    mutationFn: ({
      payload,
      ipAddress,
    }: {
      payload: WifiConfigPayload;
      ipAddress?: string | null;
    }) => devicesApi.provisionLocalWifi(payload, ipAddress),
  });
}

export function useScanLocalWifiNetworksMutation() {
  return useMutation({
    mutationFn: devicesApi.scanLocalWifiNetworks,
  });
}

export function useDiscoverLocalHubsMutation() {
  return useMutation({
    mutationFn: devicesApi.discoverLocalHubs,
  });
}
