import { COLORS } from "@/constants/theme";
import { EldoraDevice } from "@/types/device.types";
import { formatRelativeTime } from "@/utils/formatters";

export function signalLabel(rssi: number | null) {
  if (rssi === null) return "Unknown";
  if (rssi >= -55) return "Strong";
  if (rssi >= -70) return "Fair";
  return "Weak";
}

export function batteryColor(level: number | null) {
  if (level === null) return COLORS.disabled;
  if (level <= 20) return "#EF4444";
  if (level <= 50) return COLORS.warning;
  return COLORS.success;
}

export function deviceStatusText(isOnline: boolean) {
  return isOnline ? "Online" : "Offline";
}

export function isWearableDevice(device: EldoraDevice) {
  const value = `${device.name} ${device.deviceId}`.toLowerCase();
  return (
    value.includes("aegis") ||
    value.includes("wear") ||
    value.includes("vest")
  );
}

export function deviceRoomLabel(device: EldoraDevice) {
  if (device.wifiSsid) return `${device.elderName} | ${device.wifiSsid}`;
  if (device.lastSeen) {
    return `${device.elderName} | ${formatRelativeTime(device.lastSeen)}`;
  }
  return `${device.elderName} | No heartbeat`;
}

export function reorderDevices(
  devices: EldoraDevice[],
  fromIndex: number,
  toIndex: number
) {
  const next = [...devices];
  const boundedToIndex = Math.max(0, Math.min(next.length - 1, toIndex));
  const [item] = next.splice(fromIndex, 1);
  next.splice(boundedToIndex, 0, item);
  return next;
}
