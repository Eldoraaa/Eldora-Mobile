import { useEffect, useMemo, useState } from "react";
import { BASE_URL } from "@/constants/api";
import { useAuthStore } from "@/stores/authStore";

type LiveTelemetryMessage = {
  type: "device.telemetry";
  homeId: string | null;
  deviceId: string;
  payload: Record<string, unknown>;
  occurredAt: string;
};

function realtimeUrl() {
  const base = BASE_URL.replace(/\/$/, "");
  if (base.startsWith("https://")) return `wss://${base.slice("https://".length)}/realtime`;
  if (base.startsWith("http://")) return `ws://${base.slice("http://".length)}/realtime`;
  return `${base}/realtime`;
}

export function useDeviceTelemetry(deviceId?: string | null, homeId?: string | null) {
  const [telemetry, setTelemetry] = useState<LiveTelemetryMessage | null>(null);
  const token = useAuthStore((state) => state.token);
  const url = useMemo(realtimeUrl, []);

  useEffect(() => {
    if (!deviceId || !token) return;
    const socket = new WebSocket(url);

    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "subscribe", deviceId, homeId, token }));
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(String(event.data)) as LiveTelemetryMessage;
        if (message.type === "device.telemetry" && message.deviceId === deviceId) {
          setTelemetry(message);
        }
      } catch {
        return;
      }
    };

    return () => {
      socket.close();
    };
  }, [deviceId, homeId, token, url]);

  return telemetry;
}
