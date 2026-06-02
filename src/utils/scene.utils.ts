import { EldoraDevice } from "@/types/device.types";
import {
  EldoraScene,
  SceneActions,
  SceneDeviceType,
  SceneTriggerConfig,
} from "@/types/scene.types";

type BoundDeviceType = Exclude<SceneDeviceType, "any">;
type SceneCondition = NonNullable<SceneTriggerConfig["condition"]>;

function formatDeviceType(deviceType?: string | null) {
  if (deviceType === "aegiswear") return "AegisWear";
  if (deviceType === "eldora_core") return "Eldora Core";
  return null;
}

function displayDeviceName(device?: EldoraDevice) {
  if (!device) return null;
  if (device.name) return device.name;
  if (device.deviceId) return `Device ${device.deviceId.slice(-4)}`;
  return "Device";
}

function sceneTriggerConfig(scene: EldoraScene) {
  return scene.triggerConfig as SceneTriggerConfig | null;
}

function sceneActions(scene: EldoraScene) {
  return scene.actions as SceneActions | null;
}

function sceneConditions(scene: EldoraScene) {
  const triggerConfig = sceneTriggerConfig(scene);
  if (Array.isArray(triggerConfig?.conditions)) return triggerConfig.conditions;
  return triggerConfig?.condition ? [triggerConfig.condition] : [];
}

export function getSceneDeviceSummary(
  scene: EldoraScene,
  devicesById?: Map<string, EldoraDevice>
) {
  const triggerConfig = sceneTriggerConfig(scene);
  const actions = sceneActions(scene);
  const devices = new Set<string>();

  sceneConditions(scene).forEach((condition) => {
    const triggerDeviceType = condition.deviceType;
    const triggerDeviceId =
      triggerDeviceType === "aegiswear" || triggerDeviceType === "eldora_core"
        ? triggerConfig?.deviceBindings?.[triggerDeviceType]
        : undefined;
    const triggerDevice =
      displayDeviceName(triggerDeviceId ? devicesById?.get(triggerDeviceId) : undefined) ??
      formatDeviceType(triggerDeviceType);
    if (triggerDevice) devices.add(triggerDevice);
  });

  actions?.steps?.forEach((step) => {
    const actionDeviceId =
      step.target === "aegiswear" || step.target === "eldora_core"
        ? actions.deviceBindings?.[step.target] ?? triggerConfig?.deviceBindings?.[step.target]
        : undefined;
    const actionDevice =
      displayDeviceName(actionDeviceId ? devicesById?.get(actionDeviceId) : undefined) ??
      formatDeviceType(step.target);
    if (actionDevice) devices.add(actionDevice);
  });

  if (devices.size === 0 && scene.mode === "tap") {
    devices.add("Eldora Core");
  }

  return Array.from(devices).join(" + ");
}

export function getSceneBoundDeviceIds(scene: EldoraScene) {
  const triggerConfig = sceneTriggerConfig(scene);
  const actions = sceneActions(scene);
  const ids = new Set<string>();

  Object.values(triggerConfig?.deviceBindings ?? {}).forEach((id) => {
    if (id) ids.add(id);
  });
  Object.values(actions?.deviceBindings ?? {}).forEach((id) => {
    if (id) ids.add(id);
  });

  return Array.from(ids);
}

function primaryDeviceType(scene: EldoraScene): BoundDeviceType | null {
  const triggerDeviceType = sceneConditions(scene).find(
    (condition): condition is SceneCondition & { deviceType: BoundDeviceType } =>
      condition.deviceType === "aegiswear" || condition.deviceType === "eldora_core"
  )?.deviceType;
  if (triggerDeviceType === "aegiswear" || triggerDeviceType === "eldora_core") {
    return triggerDeviceType;
  }

  const actionTarget = sceneActions(scene)?.steps.find(
    (step) => step.target === "aegiswear" || step.target === "eldora_core"
  )?.target;

  return actionTarget === "aegiswear" || actionTarget === "eldora_core"
    ? actionTarget
    : null;
}

export function sceneMatchesRoom(
  scene: EldoraScene,
  roomId: string | undefined,
  devicesById: Map<string, EldoraDevice>
) {
  if (!roomId) return true;
  if (scene.roomCategory?.id === roomId) return true;

  return getSceneBoundDeviceIds(scene).some(
    (deviceId) => devicesById.get(deviceId)?.roomCategory?.id === roomId
  );
}

export function groupScenesByDevice(
  scenes: EldoraScene[],
  devicesById: Map<string, EldoraDevice>
) {
  const groups = new Map<
    string,
    {
      key: string;
      title: string;
      subtitle: string;
      scenes: EldoraScene[];
    }
  >();

  scenes.forEach((scene) => {
    const triggerConfig = sceneTriggerConfig(scene);
    const primaryType = primaryDeviceType(scene);
    const primaryDeviceId = primaryType
      ? triggerConfig?.deviceBindings?.[primaryType] ??
        sceneActions(scene)?.deviceBindings?.[primaryType]
      : undefined;
    const primaryDevice = primaryDeviceId
      ? devicesById.get(primaryDeviceId)
      : undefined;
    const fallbackTitle = primaryType ? `${formatDeviceType(primaryType)} not selected` : null;
    const key = primaryDevice?.id ?? primaryType ?? "whole_home";
    const title = displayDeviceName(primaryDevice) ?? fallbackTitle ?? "Whole Home";
    const subtitle =
      primaryDevice?.roomCategory?.name ??
      (primaryDevice ? "Device scenes" : fallbackTitle ? "Choose a device for this scene" : "Home scenes");

    if (!groups.has(key)) {
      groups.set(key, { key, title, subtitle, scenes: [] });
    }

    groups.get(key)!.scenes.push(scene);
  });

  return Array.from(groups.values());
}
