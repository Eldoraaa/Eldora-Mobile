export interface DeviceStatus {
  id: string;
  deviceId: string;
  name: string;
  isOnline: boolean;
  lastSeen: string | null;
  batteryLevel?: number | null;
  isCharging?: boolean;
  wifiSsid?: string | null;
  wifiRssi?: number | null;
  firmwareVersion?: string | null;
}

export interface HomeSummary {
  devices: DeviceStatus[];
}
