import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { sceneApi } from "@/api/sceneApi";
import { queryKeys } from "@/lib/queryClient";
import {
  CreateScenePayload,
  SceneMode,
  UpdateScenePayload,
} from "@/types/scene.types";

export function useScenesQuery(input: {
  homeId?: string | null;
  mode?: SceneMode;
  roomCategoryId?: string;
}) {
  return useQuery({
    queryKey: queryKeys.scenes.list(
      input.homeId,
      input.mode,
      input.roomCategoryId
    ),
    queryFn: () =>
      sceneApi.getScenes({
        homeId: input.homeId!,
        mode: input.mode,
        roomCategoryId: input.roomCategoryId,
      }),
    enabled: Boolean(input.homeId),
  });
}

export function useSceneQuery(sceneId?: string | null) {
  return useQuery({
    queryKey: queryKeys.scenes.detail(sceneId),
    queryFn: () => sceneApi.getScene(sceneId!),
    enabled: Boolean(sceneId),
  });
}

export function useCreateSceneMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateScenePayload) => sceneApi.createScene(payload),
    onSuccess: (scene) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.scenes.list(scene.homeId),
      });
      queryClient.setQueryData(queryKeys.scenes.detail(scene.id), scene);
    },
  });
}

export function useExecuteSceneMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sceneId: string) => sceneApi.executeScene(sceneId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.home.safetySummary });
    },
  });
}

export function useDeleteSceneMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sceneId: string) => sceneApi.deleteScene(sceneId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["scenes"] });
    },
  });
}

export function useUpdateSceneMutation(sceneId?: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateScenePayload) =>
      sceneApi.updateScene(sceneId!, payload),
    onSuccess: (scene) => {
      queryClient.setQueryData(queryKeys.scenes.detail(scene.id), scene);
      void queryClient.invalidateQueries({
        queryKey: queryKeys.scenes.list(scene.homeId),
      });
    },
  });
}
