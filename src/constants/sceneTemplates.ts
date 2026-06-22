import { Clock3, LucideIcon } from "lucide-react-native";
import { COLORS } from "@/constants/theme";
import { SceneTemplate } from "@/types/scene.types";

export type SceneTemplateView = SceneTemplate & {
  Icon: LucideIcon;
  color: string;
};

export const SCENE_TEMPLATES: SceneTemplateView[] = [
  {
    id: "scheduled_reminder",
    title: "Daily / weekly reminder",
    description: "Schedule DoraBot to speak any reminder or greeting at a chosen time.",
    category: "care",
    devices: [{ name: "DoraBot", role: "speaks the reminder" }],
    ifLabel: "Set when this reminder should play.",
    thenLabel: "Write what DoraBot should say.",
    setupNote: "Use for medication, meals, hydration, check-ins, greetings, or any routine.",
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
    color: COLORS.coral,
  },
];

export function findSceneTemplate(templateId?: string | string[]) {
  const id = Array.isArray(templateId) ? templateId[0] : templateId;
  return SCENE_TEMPLATES.find((template) => template.id === id) ?? SCENE_TEMPLATES[0];
}
