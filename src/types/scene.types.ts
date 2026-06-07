export type SceneMode = "automation" | "tap";

export type SceneTriggerType =
  | "tap_to_run"
  | "device_status_changes"
  | "schedule"
  | "weather_changes"
  | "family_member_going_home";

export type SceneConditionKind =
  | "manual_tap"
  | "fall_detected"
  | "device_offline"
  | "schedule";

export type SceneActionType =
  | "send_push_alert"
  | "send_push_alert_if_no_response"
  | "activate_local_alarm"
  | "dorabot_voice_check_in"
  | "show_call_elder_action"
  | "speak_on_dorabot";

export type SceneDeviceType = "dorabot" | "dorashield" | "any";

export type SceneTriggerConfig = {
  schemaVersion: 1;
  deviceBindings?: Partial<Record<Exclude<SceneDeviceType, "any">, string>>;
  condition?: {
    kind: SceneConditionKind;
    deviceType?: SceneDeviceType;
    durationMinutes?: number;
    activeHoursOnly?: boolean;
    schedule?: {
      frequency: "daily" | "weekly";
      time: string;
    };
  };
  conditions?: Array<NonNullable<SceneTriggerConfig["condition"]>>;
};

export type SceneActions = {
  schemaVersion: 1;
  deviceBindings?: Partial<Record<Exclude<SceneDeviceType, "any">, string>>;
  steps: Array<{
    type: SceneActionType;
    target?: "caregiver" | "dorabot" | "dorashield";
    message?: string;
    delayMinutes?: number;
    notificationType?: "alarm" | "home" | "device";
    title?: string;
    body?: string;
    severity?: "normal" | "warning" | "critical";
    sound?: string;
  }>;
};

export type SceneTemplate = {
  id: string;
  title: string;
  description: string;
  category: "tap" | "safety" | "care" | "device";
  devices: Array<{
    name: "DoraBot" | "DoraShield";
    role: string;
  }>;
  ifLabel: string;
  thenLabel: string;
  setupNote: string;
  triggerType: SceneTriggerType;
  triggerConfig: SceneTriggerConfig;
  actions: SceneActions;
};

export type EldoraScene = {
  id: string;
  homeId: string;
  name: string;
  mode: SceneMode;
  triggerType: SceneTriggerType;
  triggerLabel: string;
  triggerConfig: SceneTriggerConfig | Record<string, unknown> | null;
  actions: SceneActions | Record<string, unknown> | null;
  isEnabled: boolean;
  sortOrder: number;
  roomCategory: {
    id: string;
    name: string;
    slug: string;
  } | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateScenePayload = {
  homeId: string;
  name?: string;
  triggerType: SceneTriggerType;
  roomCategoryId?: string | null;
  triggerConfig?: SceneTriggerConfig | Record<string, unknown>;
  actions?: SceneActions | Record<string, unknown>;
  isEnabled?: boolean;
};

export type UpdateScenePayload = {
  name?: string;
  triggerType?: SceneTriggerType;
  roomCategoryId?: string | null;
  triggerConfig?: SceneTriggerConfig | Record<string, unknown>;
  actions?: SceneActions | Record<string, unknown>;
  isEnabled?: boolean;
  sortOrder?: number;
};
