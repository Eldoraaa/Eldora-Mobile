import { sceneService } from "@/services/sceneService";

export const sceneApi = {
  getScenes: sceneService.getScenes,
  getScene: sceneService.getScene,
  createScene: sceneService.createScene,
  executeScene: sceneService.executeScene,
  updateScene: sceneService.updateScene,
  deleteScene: sceneService.deleteScene,
};
