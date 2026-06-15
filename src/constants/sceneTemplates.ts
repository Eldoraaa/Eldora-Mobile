import {
  Bell,
  Clock3,
  Heart,
  MessageCircle,
  PhoneCall,
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
  {
    id: "scheduled_reminder",
    title: "Scheduled reminder",
    description: "Set any daily or weekly reminder. DoraBot will speak your message at the chosen time.",
    category: "care",
    devices: [{ name: "DoraBot", role: "speaks the reminder" }],
    ifLabel: "Set when this reminder should play.",
    thenLabel: "Write what DoraBot should say.",
    setupNote: "Use for medicine, meals, hydration, prayer — any routine.",
    triggerType: "schedule",
    triggerConfig: {
      schemaVersion: 1,
      condition: {
        kind: "schedule",
        deviceType: "dorabot",
        schedule: { frequency: "daily", time: "08:00" },
      },
    },
    actions: {
      schemaVersion: 1,
      steps: [
        {
          type: "speak_on_dorabot",
          target: "dorabot",
          message: "This is your reminder. Please take care of yourself.",
        },
      ],
    },
    Icon: Clock3,
    color: COLORS.warning,
  },
  {
    id: "send_greeting",
    title: "Send a greeting",
    description: "Tap once and DoraBot delivers your personal message to the elder right now.",
    category: "tap",
    devices: [{ name: "DoraBot", role: "speaks your message" }],
    ifLabel: "Triggered immediately when you tap Run.",
    thenLabel: "Write what DoraBot should say to the elder.",
    setupNote: "Great for checking in without a phone call.",
    triggerType: "tap_to_run",
    triggerConfig: {
      schemaVersion: 1,
      condition: { kind: "manual_tap", deviceType: "dorabot" },
    },
    actions: {
      schemaVersion: 1,
      steps: [
        {
          type: "speak_on_dorabot",
          target: "dorabot",
          message: "Your family is thinking of you and hopes you are doing well today.",
        },
      ],
    },
    Icon: Heart,
    color: COLORS.coral,
  },
  {
    id: "emergency_check",
    title: "Emergency check",
    description: "DoraBot asks the elder to respond. If no answer comes, your phone gets an alert.",
    category: "tap",
    devices: [{ name: "DoraBot", role: "asks the elder to respond" }],
    ifLabel: "Triggered immediately when you tap Run.",
    thenLabel: "DoraBot speaks then waits for a response.",
    setupNote: "Use when you are worried but cannot call directly.",
    triggerType: "tap_to_run",
    triggerConfig: {
      schemaVersion: 1,
      condition: { kind: "manual_tap", deviceType: "dorabot" },
    },
    actions: {
      schemaVersion: 1,
      steps: [
        {
          type: "speak_on_dorabot",
          target: "dorabot",
          message: "Your family is checking on you. Please say Eldora so we know you are safe.",
        },
        {
          type: "send_push_alert_if_no_response",
          target: "caregiver",
          delayMinutes: 5,
          notificationType: "alarm",
          title: "No response from elder",
          body: "The elder did not respond to the emergency check. Please follow up immediately.",
          severity: "critical",
        },
      ],
    },
    Icon: PhoneCall,
    color: COLORS.coral,
  },
];

export function findSceneTemplate(templateId?: string | string[]) {
  const id = Array.isArray(templateId) ? templateId[0] : templateId;
  return SCENE_TEMPLATES.find((template) => template.id === id);
}
