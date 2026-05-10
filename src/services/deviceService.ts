import axios from "axios";
import * as Network from "expo-network";
import { apiClient } from "./api";
import { ENDPOINTS } from "@/constants/api";
import { ApiResponse } from "@/types/api.types";
import {
  DevicePairingRequest,
  EldoraDevice,
  LocalPairDevicePayload,
  LocalPairResult,
  LocalProvisioningInfo,
  PairDevicePayload,
  WifiConfigPayload,
  WifiNetwork,
} from "@/types/device.types";

const LOCAL_PROVISIONING_HOST = "192.168.4.1";
const LOCAL_SCAN_TIMEOUT_MS = 850;
const LOCAL_SCAN_CONCURRENCY = 28;

function isIPv4(value: string) {
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(value);
}

function subnetFromIp(ipAddress: string) {
  if (!isIPv4(ipAddress) || ipAddress === "0.0.0.0") return null;
  const parts = ipAddress.split(".");
  return `${parts[0]}.${parts[1]}.${parts[2]}`;
}

function buildDiscoveryCandidates(ipAddress: string) {
  const candidates = new Set<string>([LOCAL_PROVISIONING_HOST]);
  const subnet = subnetFromIp(ipAddress);

  if (subnet) {
    for (let host = 1; host <= 254; host += 1) {
      const candidate = `${subnet}.${host}`;
      if (candidate !== ipAddress) candidates.add(candidate);
    }
  }

  return Array.from(candidates);
}

function isEldoraHub(value: unknown): value is Omit<LocalProvisioningInfo, "ipAddress"> {
  const maybeHub = value as Partial<LocalProvisioningInfo>;
  return (
    maybeHub?.productName === "ELDORA_CARE" &&
    typeof maybeHub.deviceKey === "string" &&
    typeof maybeHub.pairingToken === "string"
  );
}

async function probeHub(ipAddress: string): Promise<LocalProvisioningInfo | null> {
  try {
    const response = await axios.get(`http://${ipAddress}/status`, {
      timeout: LOCAL_SCAN_TIMEOUT_MS,
    });

    if (!isEldoraHub(response.data)) return null;

    return {
      ...response.data,
      ipAddress,
    };
  } catch {
    return null;
  }
}

async function runDiscoveryPool(candidates: string[]) {
  const hubs: LocalProvisioningInfo[] = [];
  let cursor = 0;

  async function worker() {
    while (cursor < candidates.length) {
      const current = candidates[cursor];
      cursor += 1;
      const hub = await probeHub(current);

      if (
        hub &&
        !hubs.some((item) => item.deviceKey === hub.deviceKey)
      ) {
        hubs.push(hub);
      }
    }
  }

  const workers = Array.from(
    { length: Math.min(LOCAL_SCAN_CONCURRENCY, candidates.length) },
    () => worker()
  );

  await Promise.all(workers);
  return hubs;
}

export const deviceService = {
  async getDevices(): Promise<EldoraDevice[]> {
    const response = await apiClient.get<ApiResponse<EldoraDevice[]>>(
      ENDPOINTS.DEVICES
    );
    return response.data.data;
  },

  async pairDevice(payload: PairDevicePayload): Promise<EldoraDevice> {
    const response = await apiClient.post<ApiResponse<EldoraDevice>>(
      ENDPOINTS.PAIR_DEVICE,
      payload
    );
    return response.data.data;
  },

  async pairLocalDevice(payload: LocalPairDevicePayload): Promise<LocalPairResult> {
    const response = await apiClient.post<
      ApiResponse<EldoraDevice | DevicePairingRequest>
    >(ENDPOINTS.LOCAL_PAIR_DEVICE, payload);

    if (response.status === 202) {
      return {
        kind: "pending",
        request: response.data.data as DevicePairingRequest,
        message: response.data.message ?? "Pairing request sent",
      };
    }

    return {
      kind: "paired",
      device: response.data.data as EldoraDevice,
      message: response.data.message ?? "Device paired",
    };
  },

  async getPairingRequests(): Promise<DevicePairingRequest[]> {
    const response = await apiClient.get<ApiResponse<DevicePairingRequest[]>>(
      ENDPOINTS.PAIRING_REQUESTS
    );
    return response.data.data;
  },

  async approvePairingRequest(requestId: string): Promise<EldoraDevice> {
    const response = await apiClient.post<ApiResponse<EldoraDevice>>(
      `${ENDPOINTS.PAIRING_REQUESTS}/${requestId}/approve`
    );
    return response.data.data;
  },

  async rejectPairingRequest(requestId: string): Promise<void> {
    await apiClient.post<ApiResponse<null>>(
      `${ENDPOINTS.PAIRING_REQUESTS}/${requestId}/reject`
    );
  },

  async queueWifiConfig(
    deviceId: string,
    payload: WifiConfigPayload
  ): Promise<void> {
    await apiClient.post<ApiResponse<unknown>>(
      `${ENDPOINTS.DEVICES}/${deviceId}/wifi`,
      payload
    );
  },

  async provisionLocalWifi(
    payload: WifiConfigPayload,
    ipAddress = LOCAL_PROVISIONING_HOST
  ): Promise<void> {
    await axios.post(`http://${ipAddress}/wifi`, payload, {
      timeout: 8000,
      headers: { "Content-Type": "application/json" },
    });
  },

  async scanLocalWifiNetworks(
    ipAddress = LOCAL_PROVISIONING_HOST
  ): Promise<WifiNetwork[]> {
    const response = await axios.get<{ networks: WifiNetwork[] }>(
      `http://${ipAddress}/wifi/scan`,
      { timeout: 15000 }
    );

    return response.data.networks ?? [];
  },

  async getLocalProvisioningInfo(
    ipAddress = LOCAL_PROVISIONING_HOST
  ): Promise<LocalProvisioningInfo> {
    const response = await axios.get(`http://${ipAddress}/status`, {
      timeout: 5000,
    });

    return {
      ...response.data,
      ipAddress,
    };
  },

  async discoverLocalHubs(): Promise<LocalProvisioningInfo[]> {
    const ipAddress = await Network.getIpAddressAsync();
    const candidates = buildDiscoveryCandidates(ipAddress);
    return runDiscoveryPool(candidates);
  },
};
