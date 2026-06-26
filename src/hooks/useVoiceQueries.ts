import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { voiceApi } from "@/api/voiceApi";
import { queryKeys } from "@/lib/queryClient";

export function useElderRemindersQuery(homeId?: string | null) {
  return useQuery({
    queryKey: queryKeys.voice.reminders(homeId),
    queryFn: () => voiceApi.getReminders(homeId),
  });
}

export function useElderReminderQuery(reminderId?: string | null) {
  return useQuery({
    queryKey: queryKeys.voice.reminder(reminderId),
    queryFn: () => voiceApi.getReminder(reminderId!),
    enabled: Boolean(reminderId),
  });
}

export function useMemoryFactsQuery(status = "candidate") {
  return useQuery({
    queryKey: queryKeys.voice.memoryFacts(status),
    queryFn: () => voiceApi.getMemoryFacts(status),
  });
}

export function useApproveMemoryFactMutation(status = "candidate") {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (factId: string) => voiceApi.approveMemoryFact(factId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.voice.memoryFacts(status) });
    },
  });
}

export function useRejectMemoryFactMutation(status = "candidate") {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (factId: string) => voiceApi.rejectMemoryFact(factId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.voice.memoryFacts(status) });
    },
  });
}

export function useCancelElderReminderMutation(homeId?: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reminderId: string) => voiceApi.cancelReminder(reminderId),
    onSuccess: (reminder) => {
      queryClient.setQueryData(queryKeys.voice.reminder(reminder.id), reminder);
      void queryClient.invalidateQueries({ queryKey: queryKeys.voice.reminders(homeId) });
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useAcknowledgeElderReminderMutation(homeId?: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reminderId: string) => voiceApi.acknowledgeReminder(reminderId),
    onSuccess: (reminder) => {
      queryClient.setQueryData(queryKeys.voice.reminder(reminder.id), reminder);
      void queryClient.invalidateQueries({ queryKey: queryKeys.voice.reminders(homeId) });
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
