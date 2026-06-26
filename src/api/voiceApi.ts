import { ENDPOINTS } from "@/constants/api";
import { apiClient } from "@/services/api";
import { ApiResponse } from "@/types/api.types";
import { MemoryFact } from "@/types/memory.types";
import { ElderReminder } from "@/types/voice.types";

export const voiceApi = {
  async getReminders(homeId?: string | null): Promise<ElderReminder[]> {
    const response = await apiClient.get<ApiResponse<ElderReminder[]>>(
      ENDPOINTS.VOICE_REMINDERS,
      { params: homeId ? { homeId } : undefined }
    );
    return response.data.data;
  },

  async getReminder(reminderId: string): Promise<ElderReminder> {
    const response = await apiClient.get<ApiResponse<ElderReminder>>(
      `${ENDPOINTS.VOICE_REMINDERS}/${reminderId}`
    );
    return response.data.data;
  },

  async cancelReminder(reminderId: string): Promise<ElderReminder> {
    const response = await apiClient.patch<ApiResponse<ElderReminder>>(
      `${ENDPOINTS.VOICE_REMINDERS}/${reminderId}/cancel`
    );
    return response.data.data;
  },

  async acknowledgeReminder(reminderId: string): Promise<ElderReminder> {
    const response = await apiClient.patch<ApiResponse<ElderReminder>>(
      `${ENDPOINTS.VOICE_REMINDERS}/${reminderId}/ack`
    );
    return response.data.data;
  },

  async getMemoryFacts(status = "candidate"): Promise<MemoryFact[]> {
    const response = await apiClient.get<ApiResponse<MemoryFact[]>>("/voice/memory-facts", { params: { status } });
    return response.data.data;
  },

  async approveMemoryFact(factId: string): Promise<MemoryFact> {
    const response = await apiClient.patch<ApiResponse<MemoryFact>>(`/voice/memory-facts/${factId}/approve`);
    return response.data.data;
  },

  async rejectMemoryFact(factId: string): Promise<MemoryFact> {
    const response = await apiClient.patch<ApiResponse<MemoryFact>>(`/voice/memory-facts/${factId}/reject`);
    return response.data.data;
  },
};
