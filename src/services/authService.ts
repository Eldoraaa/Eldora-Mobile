import { apiClient } from "./api";
import { ENDPOINTS } from "@/constants/api";
import { LoginRequest, LoginResponse } from "@/types/auth.types";
import { ApiResponse } from "@/types/api.types";

export const authService = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      ENDPOINTS.LOGIN,
      data
    );
    return response.data.data;
  },
};
