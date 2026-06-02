import { deviceService } from "@/services/deviceService";
import {
  DevicePairingRequest,
  EldoraDevice,
  DeviceManagementPayload,
  CreateRoomCategoryPayload,
  LocalPairDevicePayload,
  LocalPairResult,
  LocalProvisioningInfo,
  RoomCategory,
  UpdateRoomCategoriesPayload,
  WifiConfigPayload,
  WifiNetwork,
} from "@/types/device.types";

export type DevicesScreenData = {
  devices: EldoraDevice[];
  pairingRequests: DevicePairingRequest[];
};

export const devicesApi = {
  getDevices: deviceService.getDevices,
  getRoomCategories: deviceService.getRoomCategories,
  createRoomCategory(
    payload: CreateRoomCategoryPayload,
    homeId?: string | null
  ): Promise<RoomCategory> {
    return deviceService.createRoomCategory(payload, homeId);
  },
  updateRoomCategories(
    payload: UpdateRoomCategoriesPayload,
    homeId?: string | null
  ): Promise<RoomCategory[]> {
    return deviceService.updateRoomCategories(payload, homeId);
  },
  deleteRoomCategory(roomId: string, homeId?: string | null): Promise<void> {
    return deviceService.deleteRoomCategory(roomId, homeId);
  },
  pairDevice: deviceService.pairDevice,
  pairLocalDevice(payload: LocalPairDevicePayload): Promise<LocalPairResult> {
    return deviceService.pairLocalDevice(payload);
  },
  getPairingRequests: deviceService.getPairingRequests,
  approvePairingRequest(requestId: string): Promise<EldoraDevice> {
    return deviceService.approvePairingRequest(requestId);
  },
  rejectPairingRequest(requestId: string): Promise<void> {
    return deviceService.rejectPairingRequest(requestId);
  },
  queueWifiConfig(deviceId: string, payload: WifiConfigPayload): Promise<void> {
    return deviceService.queueWifiConfig(deviceId, payload);
  },
  updateDeviceManagement(
    payload: DeviceManagementPayload
  ): Promise<EldoraDevice[]> {
    return deviceService.updateDeviceManagement(payload);
  },
  provisionLocalWifi(
    payload: WifiConfigPayload,
    ipAddress?: string | null
  ): Promise<void> {
    return deviceService.provisionLocalWifi(payload, ipAddress ?? undefined);
  },
  scanLocalWifiNetworks(ipAddress?: string | null): Promise<WifiNetwork[]> {
    return deviceService.scanLocalWifiNetworks(ipAddress ?? undefined);
  },
  discoverLocalHubs(): Promise<LocalProvisioningInfo[]> {
    return deviceService.discoverLocalHubs();
  },
  async getScreenData(): Promise<DevicesScreenData> {
    const [devices, pairingRequests] = await Promise.all([
      deviceService.getDevices(),
      deviceService.getPairingRequests().catch(() => []),
    ]);

    return { devices, pairingRequests };
  },
};
