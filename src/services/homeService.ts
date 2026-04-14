import { apiClient } from "./api";
import { ENDPOINTS } from "@/constants/api";
import { HomeSummary } from "@/types/home.types";
import { Alert } from "@/types/alert.types";
import { ApiResponse } from "@/types/api.types";

export const homeService = {
  async getSummary(): Promise<HomeSummary> {
    const response = await apiClient.get<ApiResponse<HomeSummary>>(
      ENDPOINTS.HOME_SUMMARY
    );
    return response.data.data;
  },

  async getAlerts(): Promise<Alert[]> {
    const response = await apiClient.get<ApiResponse<Alert[]>>(
      ENDPOINTS.ALERTS
    );
    return response.data.data;
  },
};
