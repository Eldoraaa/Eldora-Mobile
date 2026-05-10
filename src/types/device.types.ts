export interface EldoraDevice {
  id: string;
  deviceId: string;
  name: string;
  elderName: string;
  isOnline: boolean;
  lastSeen: string | null;
  batteryLevel: number | null;
  isCharging: boolean;
  wifiSsid: string | null;
  wifiRssi: number | null;
  localIp?: string | null;
  firmwareVersion: string | null;
  caregiverCount: number;
}

export interface PairDevicePayload {
  deviceKey: string;
  elderName?: string;
  deviceName?: string;
}

export interface LocalPairDevicePayload extends PairDevicePayload {
  pairingToken: string;
  localIp?: string;
}

export interface WifiConfigPayload {
  ssid: string;
  password?: string;
}

export interface WifiNetwork {
  ssid: string;
  rssi: number;
  secure: boolean;
  channel?: number;
}

export interface LocalProvisioningInfo {
  productName: string;
  deviceKey: string;
  pairingToken: string;
  firmwareVersion: string;
  setupSsid: string;
  setupIp: string;
  ipAddress: string;
  hasWifi: boolean;
  wifiSsid?: string | null;
  batteryLevel?: number | null;
  isCharging?: boolean;
}

export interface DevicePairingRequest {
  id: string;
  status: "pending" | "approved" | "rejected" | "expired";
  expiresAt: string;
  createdAt: string;
  requester: {
    id: string;
    name: string;
    email: string;
  };
  device: EldoraDevice;
}

export type LocalPairResult =
  | { kind: "paired"; device: EldoraDevice; message: string }
  | { kind: "pending"; request: DevicePairingRequest; message: string };
