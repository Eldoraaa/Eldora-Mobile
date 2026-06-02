import { sceneService } from "@/services/sceneService";

export const sceneApi = {
  getScenes: sceneService.getScenes,
  getScene: sceneService.getScene,
  createScene: sceneService.createScene,
  updateScene: sceneService.updateScene,
};
