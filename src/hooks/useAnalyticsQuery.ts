import { useQuery } from "@tanstack/react-query";
import { analyticsApi, type ElderAnalyticsParams } from "@/api/analyticsApi";

export function useElderAnalyticsQuery(params: ElderAnalyticsParams) {
  return useQuery({
    queryKey: ["analytics", "elder", params.from, params.to, params.homeId, params.deviceId],
    queryFn: () => analyticsApi.getElderAnalytics(params),
    staleTime: 2 * 60 * 1000,
  });
}
