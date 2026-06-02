import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { devicesApi, DevicesScreenData } from "@/api/devicesApi";
import { queryKeys } from "@/lib/queryClient";
import {
  EldoraDevice,
  DeviceManagementPayload,
  CreateRoomCategoryPayload,
  LocalPairDevicePayload,
  UpdateRoomCategoriesPayload,
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

export function useRoomCategoriesQuery(homeId?: string | null) {
  return useQuery({
    queryKey: queryKeys.devices.roomCategories(homeId),
    queryFn: () => devicesApi.getRoomCategories(homeId),
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

export function useUpdateDeviceManagementMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: DeviceManagementPayload) =>
      devicesApi.updateDeviceManagement(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.devices.screen });
    },
  });
}

export function useCreateRoomCategoryMutation(homeId?: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateRoomCategoryPayload) =>
      devicesApi.createRoomCategory(payload, homeId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.devices.roomCategories(homeId),
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.home.homes });
      if (homeId) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.home.settings(homeId),
        });
      }
    },
  });
}

export function useUpdateRoomCategoriesMutation(homeId?: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateRoomCategoriesPayload) =>
      devicesApi.updateRoomCategories(payload, homeId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.devices.roomCategories(homeId),
      });
      if (homeId) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.home.settings(homeId),
        });
      }
    },
  });
}

export function useDeleteRoomCategoryMutation(homeId?: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roomId: string) => devicesApi.deleteRoomCategory(roomId, homeId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.devices.roomCategories(homeId),
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.devices.screen });
      void queryClient.invalidateQueries({ queryKey: queryKeys.home.homes });
      if (homeId) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.home.settings(homeId),
        });
      }
    },
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
