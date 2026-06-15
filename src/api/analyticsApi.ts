import { apiClient } from "@/services/api";

export type AnalyticsPeriod = "1d" | "7d" | "30d" | "90d" | "custom";

export type ElderAnalyticsParams = {
  from?: string;
  to?: string;
  homeId?: string;
};

export type VoicePerDay = {
  date: string;
  total: number;
  distressed: number;
  anxious: number;
  sad: number;
  happy: number;
  calm: number;
  neutral: number;
};

export type AlertsPerDay = {
  date: string;
  falls: number;
  sos: number;
  voice: number;
  device: number;
  other: number;
};

export type ActiveHour = { hour: number; count: number };

export type ElderAnalyticsResult = {
  period: { from: string; to: string };
  totals: {
    voiceInteractions: number;
    falls: number;
    sos: number;
    alerts: number;
    resolvedAlerts: number;
  };
  avgResponseTimeMs: number | null;
  avgVoiceLatencyMs: number | null;
  dominantEmotion: string | null;
  emotionTotals: Record<string, number>;
  voicePerDay: VoicePerDay[];
  alertsPerDay: AlertsPerDay[];
  intentBreakdown: Record<string, number>;
  activeHours: ActiveHour[];
  generatedAt: string;
};

export const analyticsApi = {
  getElderAnalytics: async (params: ElderAnalyticsParams): Promise<ElderAnalyticsResult> => {
    const query = new URLSearchParams();
    if (params.from) query.set("from", params.from);
    if (params.to) query.set("to", params.to);
    if (params.homeId) query.set("homeId", params.homeId);
    const res = await apiClient.get(`/analytics/elder?${query.toString()}`);
    return (res.data as { data: ElderAnalyticsResult }).data;
  },
};
