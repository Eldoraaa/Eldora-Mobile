import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { homeApi } from "@/api/homeApi";
import { queryKeys } from "@/lib/queryClient";
import {
  CreateHomeInvitationPayload,
  CreateHomePayload,
  HomeMemberRoleInput,
  JoinHomePayload,
  UpdateHomePayload,
} from "@/types/home.types";

export function useHomesQuery() {
  return useQuery({
    queryKey: queryKeys.home.homes,
    queryFn: homeApi.getHomes,
  });
}

export function useHomeSettingsQuery(homeId?: string | null) {
  return useQuery({
    queryKey: queryKeys.home.settings(homeId),
    queryFn: () => homeApi.getHomeSettings(homeId!),
    enabled: Boolean(homeId),
  });
}

export function useCreateHomeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateHomePayload) => homeApi.createHome(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.home.homes });
    },
  });
}

export function useJoinHomeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: JoinHomePayload) => homeApi.joinHome(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.home.homes });
      void queryClient.invalidateQueries({ queryKey: queryKeys.home.summary });
    },
  });
}

export function useCreateHomeInvitationMutation(homeId?: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateHomeInvitationPayload) =>
      homeApi.createHomeInvitation(homeId!, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.home.settings(homeId),
      });
    },
  });
}

export function useUpdateHomeMutation(homeId?: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateHomePayload) => homeApi.updateHome(homeId!, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.home.homes });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.home.settings(homeId),
      });
    },
  });
}

export function useUpdateHomeMemberRoleMutation(homeId?: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      memberId,
      role,
    }: {
      memberId: string;
      role: HomeMemberRoleInput;
    }) => homeApi.updateHomeMemberRole(homeId!, memberId, role),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.home.settings(homeId),
      });
    },
  });
}

export function useRemoveHomeMemberMutation(homeId?: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId: string) => homeApi.removeHomeMember(homeId!, memberId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.home.homes });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.home.settings(homeId),
      });
    },
  });
}
