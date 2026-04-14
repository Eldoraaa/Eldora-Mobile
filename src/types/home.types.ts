import { Alert } from "./alert.types";

export interface DeviceStatus {
  deviceId: string;
  name: string;
  isOnline: boolean;
  lastSeen: string;
}

export interface HomeSummary {
  greeting: string;
  elderName: string;
  devices: DeviceStatus[];
  recentAlerts: Alert[];
  unreadAlertCount: number;
}
