import { apiClient } from "./api";
import { ENDPOINTS } from "@/constants/api";
import {
  CreateHomePayload,
  CreateHomeInvitationPayload,
  HomeInvitation,
  HomeListItem,
  HomeMemberRoleInput,
  HomeSettings,
  HomeSummary,
  JoinHomePayload,
  UpdateHomePayload,
} from "@/types/home.types";
import { ApiResponse } from "@/types/api.types";

export const homeService = {
  async getSummary(): Promise<HomeSummary> {
    const response = await apiClient.get<ApiResponse<HomeSummary>>(
      ENDPOINTS.HOME_SUMMARY
    );
    return response.data.data;
  },

  async getHomes(): Promise<HomeListItem[]> {
    const response = await apiClient.get<ApiResponse<HomeListItem[]>>(
      ENDPOINTS.HOMES
    );
    return response.data.data;
  },

  async createHome(payload: CreateHomePayload): Promise<HomeListItem> {
    const response = await apiClient.post<ApiResponse<HomeListItem>>(
      ENDPOINTS.HOMES,
      payload
    );
    return response.data.data;
  },

  async joinHome(payload: JoinHomePayload): Promise<HomeListItem> {
    const response = await apiClient.post<ApiResponse<HomeListItem>>(
      `${ENDPOINTS.HOMES}/join`,
      payload
    );
    return response.data.data;
  },

  async createHomeInvitation(
    homeId: string,
    payload: CreateHomeInvitationPayload
  ): Promise<HomeInvitation> {
    const response = await apiClient.post<ApiResponse<HomeInvitation>>(
      `${ENDPOINTS.HOMES}/${homeId}/invitations`,
      payload
    );
    return response.data.data;
  },

  async getHomeSettings(homeId: string): Promise<HomeSettings> {
    const response = await apiClient.get<ApiResponse<HomeSettings>>(
      `${ENDPOINTS.HOMES}/${homeId}`
    );
    return response.data.data;
  },

  async updateHome(
    homeId: string,
    payload: UpdateHomePayload
  ): Promise<HomeListItem> {
    const response = await apiClient.patch<ApiResponse<HomeListItem>>(
      `${ENDPOINTS.HOMES}/${homeId}`,
      payload
    );
    return response.data.data;
  },

  async updateHomeMemberRole(
    homeId: string,
    memberId: string,
    role: HomeMemberRoleInput
  ): Promise<void> {
    await apiClient.patch<ApiResponse<null>>(
      `${ENDPOINTS.HOMES}/${homeId}/members/${memberId}`,
      { role }
    );
  },

  async removeHomeMember(homeId: string, memberId: string): Promise<void> {
    await apiClient.delete<ApiResponse<null>>(
      `${ENDPOINTS.HOMES}/${homeId}/members/${memberId}`
    );
  },
};
