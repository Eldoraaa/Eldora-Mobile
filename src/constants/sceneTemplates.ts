import {
  Bell,
  Clock3,
  MessageCircle,
  LucideIcon,
} from "lucide-react-native";
import { COLORS } from "@/constants/theme";
import { SceneTemplate } from "@/types/scene.types";

export type SceneTemplateView = SceneTemplate & {
  Icon: LucideIcon;
  color: string;
};

export const SCENE_TEMPLATES: SceneTemplateView[] = [
  {
    id: "scheduled_check_in",
    title: "Scheduled check-in",
    description: "At a chosen time, DoraBot asks whether the elder is okay.",
    category: "care",
    devices: [
      { name: "DoraBot", role: "speaks the check-in" },
    ],
    ifLabel: "Add a schedule condition after choosing the device.",
    thenLabel: "Add what DoraBot should say after the condition runs.",
    setupNote: "Good for daily reassurance without opening a full call.",
    triggerType: "schedule",
    triggerConfig: {
      schemaVersion: 1,
      condition: {
        kind: "schedule",
        deviceType: "dorabot",
        schedule: {
          frequency: "daily",
          time: "09:00",
        },
      },
    },
    actions: {
      schemaVersion: 1,
      steps: [
        {
          type: "dorabot_voice_check_in",
          target: "dorabot",
          message: "Good morning. Are you feeling okay today? Please answer Eldora so your family knows you are safe.",
        },
      ],
    },
    Icon: MessageCircle,
    color: COLORS.coral,
  },
  {
    id: "fall_response",
    title: "Fall response",
    description: "DoraShield detects a fall and sends a critical phone alert.",
    category: "safety",
    devices: [
      { name: "DoraShield", role: "detects the fall" },
    ],
    ifLabel: "Add a fall detection condition after choosing DoraShield.",
    thenLabel: "Add the alert action you want the family to receive.",
    setupNote: "Use after DoraShield is paired for fall detection.",
    triggerType: "device_status_changes",
    triggerConfig: {
      schemaVersion: 1,
      condition: {
        kind: "fall_detected",
        deviceType: "dorashield",
      },
    },
    actions: {
      schemaVersion: 1,
      steps: [
        {
          type: "send_push_alert",
          target: "caregiver",
          notificationType: "alarm",
          title: "Fall detected",
          body: "DoraShield detected a fall. Check immediately.",
          severity: "critical",
          sound: "critical_alert",
        },
      ],
    },
    Icon: Bell,
    color: COLORS.coral,
  },
  {
    id: "medication_reminder",
    title: "Medication reminder",
    description: "Schedule DoraBot to speak a daily medicine reminder.",
    category: "care",
    devices: [
      { name: "DoraBot", role: "speaks the reminder" },
    ],
    ifLabel: "Add a schedule condition after choosing DoraBot.",
    thenLabel: "Add the reminder message DoraBot should say.",
    setupNote: "For daily care routines managed by family.",
    triggerType: "schedule",
    triggerConfig: {
      schemaVersion: 1,
      condition: {
        kind: "schedule",
        deviceType: "dorabot",
        schedule: {
          frequency: "daily",
          time: "07:00",
        },
      },
    },
    actions: {
      schemaVersion: 1,
      steps: [
        {
          type: "speak_on_dorabot",
          target: "dorabot",
          message: "It is time for your morning medicine. Please tell Eldora after you take it.",
        },
        {
          type: "send_push_alert_if_no_response",
          target: "caregiver",
          delayMinutes: 15,
          notificationType: "home",
          title: "Medication reminder not confirmed",
          body: "The elder has not confirmed the medication reminder yet.",
          severity: "normal",
        },
      ],
    },
    Icon: Clock3,
    color: COLORS.success,
  },
];

export function findSceneTemplate(templateId?: string | string[]) {
  const id = Array.isArray(templateId) ? templateId[0] : templateId;
  return SCENE_TEMPLATES.find((template) => template.id === id);
}
