import { useQuery } from "@tanstack/react-query";
import { homeApi } from "@/api/homeApi";
import { queryKeys } from "@/lib/queryClient";

export function useHomeSummaryQuery() {
  return useQuery({
    queryKey: queryKeys.home.summary,
    queryFn: homeApi.getSummary,
  });
}
