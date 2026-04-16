import { apiClient } from "./api";
import { ENDPOINTS } from "@/constants/api";
import { LoginRequest, LoginResponse, RegisterRequest } from "@/types/auth.types";
import { ApiResponse } from "@/types/api.types";

export const authService = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      ENDPOINTS.LOGIN,
      data
    );
    return response.data.data;
  },

  async register(data: RegisterRequest): Promise<void> {
    await apiClient.post<ApiResponse<void>>(ENDPOINTS.REGISTER, data);
  },

  async googleLogin(idToken: string): Promise<LoginResponse> {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      ENDPOINTS.GOOGLE_LOGIN,
      { idToken }
    );
    return response.data.data;
  },
};
