import { apiClient } from "./api";
import { ENDPOINTS } from "@/constants/api";
import { ApiResponse } from "@/types/api.types";
import {
  CreateScenePayload,
  EldoraScene,
  SceneMode,
  UpdateScenePayload,
} from "@/types/scene.types";

export const sceneService = {
  async getScenes(input: {
    homeId: string;
    mode?: SceneMode;
    roomCategoryId?: string;
  }): Promise<EldoraScene[]> {
    const response = await apiClient.get<ApiResponse<EldoraScene[]>>(
      ENDPOINTS.SCENES,
      {
        params: input,
      }
    );
    return response.data.data;
  },

  async getScene(sceneId: string): Promise<EldoraScene> {
    const response = await apiClient.get<ApiResponse<EldoraScene>>(
      `${ENDPOINTS.SCENES}/${sceneId}`
    );
    return response.data.data;
  },

  async createScene(payload: CreateScenePayload): Promise<EldoraScene> {
    const response = await apiClient.post<ApiResponse<EldoraScene>>(
      ENDPOINTS.SCENES,
      payload
    );
    return response.data.data;
  },

  async executeScene(sceneId: string): Promise<void> {
    await apiClient.post<ApiResponse<null>>(`${ENDPOINTS.SCENES}/${sceneId}/execute`);
  },

  async updateScene(
    sceneId: string,
    payload: UpdateScenePayload
  ): Promise<EldoraScene> {
    const response = await apiClient.patch<ApiResponse<EldoraScene>>(
      `${ENDPOINTS.SCENES}/${sceneId}`,
      payload
    );
    return response.data.data;
  },

  async deleteScene(sceneId: string): Promise<void> {
    await apiClient.delete(`${ENDPOINTS.SCENES}/${sceneId}`);
  },
};
