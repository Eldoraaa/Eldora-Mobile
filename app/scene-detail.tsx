import React, { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import Toast from "react-native-toast-message";
import {
  Bell,
  ChevronRight,
  Clock3,
  MessageCircle,
  MousePointerClick,
  Plus,
  Router,
  Trash2,
  WifiOff,
} from "lucide-react-native";
import { ScreenHeader } from "@/components/navigation/ScreenHeader";
import { COLORS } from "@/constants/theme";
import { useBackNavigation } from "@/hooks/useBackNavigation";
import { useDeleteSceneMutation, useSceneQuery, useUpdateSceneMutation } from "@/hooks/useSceneQueries";
import {
  SceneActions,
  SceneActionType,
  SceneTriggerType,
  SceneTriggerConfig,
} from "@/types/scene.types";

type SceneActionStep = SceneActions["steps"][number];
type SceneCondition = SceneTriggerConfig["condition"];
type DeviceBindings = NonNullable<SceneTriggerConfig["deviceBindings"]>;

function cleanDeviceBindings(bindings: Record<string, string | undefined>) {
  return Object.fromEntries(
    Object.entries(bindings).filter((entry): entry is [string, string] =>
      Boolean(entry[1])
    )
  ) as DeviceBindings;
}

function formatClockLabel(value?: string) {
  if (!value) return "selected time";
  const [rawHour, rawMinute] = value.split(":");
  const hour = Number(rawHour);
  const minute = Number(rawMinute);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return value;
  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${String(minute).padStart(2, "0")} ${period}`;
}

function triggerTitle(triggerConfig: SceneTriggerConfig | null) {
  const condition = triggerConfig?.condition;
  if (!condition) return "Saved trigger";
  if (condition.kind === "manual_tap") return "Tap-to-run";
  if (condition.kind === "fall_detected") return "Fall detected";
  if (condition.kind === "device_offline") return "DoraBot offline";
  if (condition.kind === "schedule") {
    return `Schedule : ${formatClockLabel(condition.schedule?.time)}`;
  }
  return "Saved trigger";
}

function triggerDescription(triggerConfig: SceneTriggerConfig | null) {
  const condition = triggerConfig?.condition;
  if (!condition) return "Scene runs from the saved trigger.";
  if (condition.kind === "manual_tap") return "Family taps this scene from the app.";
  if (condition.kind === "fall_detected") return "DoraShield detects a fall event.";
  if (condition.kind === "device_offline") {
    return `DoraBot is offline for ${condition.durationMinutes ?? 10} minutes.`;
  }
  if (condition.kind === "schedule") {
    return condition.schedule?.frequency === "weekly" ? "Every week" : "Every day";
  }
  return "Scene runs from the saved trigger.";
}

function triggerIcon(triggerConfig: SceneTriggerConfig | null) {
  const kind = triggerConfig?.condition?.kind;
  if (kind === "schedule") return <Clock3 size={24} color={COLORS.coral} strokeWidth={2.1} />;
  if (kind === "device_offline") return <WifiOff size={24} color={COLORS.warning} strokeWidth={2.1} />;
  if (kind === "manual_tap") {
    return <MousePointerClick size={24} color={COLORS.coral} strokeWidth={2.1} />;
  }
  return <Bell size={24} color={COLORS.coral} strokeWidth={2.1} />;
}

function actionTitle(action: SceneActionStep) {
  if (action.type === "send_push_alert") return action.title ?? "Send notification";
  if (action.type === "send_push_alert_if_no_response") {
    return action.title ?? "Notify if no response";
  }
  if (action.type === "dorabot_voice_check_in") return "Ask through DoraBot";
  if (action.type === "speak_on_dorabot") return "Speak through DoraBot";
  if (action.type === "activate_local_alarm") return "Local alarm";
  if (action.type === "show_call_elder_action") return "Show call action";
  return "Run action";
}

function actionDescription(action: SceneActionStep) {
  const { type, message, delayMinutes, body, severity } = action;
  if (type === "send_push_alert") {
    return `${body ?? "Send notification to family."}${
      severity === "critical" ? " Critical alert sound enabled." : ""
    }`;
  }
  if (type === "send_push_alert_if_no_response") {
    return `${body ?? "Send notification to family if there is no response."}${
      delayMinutes ? ` Wait ${delayMinutes} minutes before sending.` : ""
    }`;
  }
  if (type === "activate_local_alarm") return "Turn on the local alarm on DoraShield.";
  if (type === "dorabot_voice_check_in") {
    return message ? `DoraBot asks: "${message}"` : "DoraBot checks on the elder.";
  }
  if (type === "show_call_elder_action") return "Show quick call action.";
  if (type === "speak_on_dorabot") {
    return message ? `DoraBot says: "${message}"` : "DoraBot plays the saved message.";
  }
  return "Run saved action.";
}

function actionIcon(type: SceneActionType) {
  if (type === "dorabot_voice_check_in" || type === "speak_on_dorabot") {
    return <Router size={24} color={COLORS.coral} strokeWidth={2.1} />;
  }
  if (type === "activate_local_alarm") {
    return <Bell size={24} color={COLORS.warning} strokeWidth={2.1} />;
  }
  return <Bell size={24} color={COLORS.coral} strokeWidth={2.1} />;
}

function RuleRow({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onPress?: () => void;
}) {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      className="flex-row items-center py-4"
      {...(onPress ? { activeOpacity: 0.76, onPress } : {})}
    >
      <View className="mr-4 h-9 w-9 items-center justify-center">
        {icon}
      </View>
      <View className="flex-1">
        <Text
          className="text-[17px] font-extrabold leading-6"
          style={{ color: COLORS.text }}
        >
          {title}
        </Text>
        <Text
          className="mt-1 text-[13px] font-semibold leading-5"
          style={{ color: COLORS.muted }}
        >
          {subtitle}
        </Text>
      </View>
      {onPress ? (
        <ChevronRight size={20} color={COLORS.disabled} strokeWidth={2.2} />
      ) : null}
    </Container>
  );
}

function SheetOption({
  title,
  description,
  icon,
  onPress,
  disabled,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      className="min-h-[56px] flex-row items-center py-4"
      activeOpacity={0.78}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={description}
      accessibilityState={{ disabled: !!disabled }}
      onPress={onPress}
      style={{ opacity: disabled ? 0.45 : 1 }}
    >
      <View className="mr-4 h-9 w-9 items-center justify-center">
        {icon}
      </View>
      <View className="flex-1">
        <Text className="text-[17px] font-extrabold leading-6" style={{ color: COLORS.text }}>
          {title}
        </Text>
        <Text className="mt-1 text-[13px] font-semibold leading-5" style={{ color: COLORS.muted }}>
          {description}
        </Text>
      </View>
      <ChevronRight size={20} color={COLORS.disabled} strokeWidth={2.2} />
    </TouchableOpacity>
  );
}

function RuleBottomSheet({
  visible,
  title,
  onClose,
  children,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end bg-black/45" onPress={onClose}>
        <Pressable
          className="rounded-t-[28px] bg-white px-8 pb-10 pt-8"
          onPress={(event) => event.stopPropagation()}
        >
          <Text className="mb-5 text-center text-[22px] font-extrabold leading-7" style={{ color: COLORS.text }}>
            {title}
          </Text>
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default function SceneDetailScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const sceneId = Array.isArray(params.id) ? params.id[0] : params.id;
  const goBack = useBackNavigation("/scene");
  const sceneQuery = useSceneQuery(sceneId);
  const updateSceneMutation = useUpdateSceneMutation(sceneId);
  const deleteSceneMutation = useDeleteSceneMutation();
  const [conditionSheetOpen, setConditionSheetOpen] = useState(false);
  const [actionSheetOpen, setActionSheetOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const scene = sceneQuery.data;
  const triggerConfig = scene?.triggerConfig as SceneTriggerConfig | null;
  const actions = scene?.actions as SceneActions | null;
  const hasCondition = Boolean(triggerConfig?.condition);
  const deviceBindings = {
    ...(triggerConfig?.deviceBindings ?? {}),
    ...(actions?.deviceBindings ?? {}),
  };
  const currentDeviceBindings = cleanDeviceBindings(deviceBindings);
  const currentActions: SceneActions = {
    schemaVersion: 1,
    deviceBindings: currentDeviceBindings,
    steps: Array.isArray(actions?.steps) ? actions.steps : [],
  };

  const updateCondition = async (
    condition: SceneCondition,
    triggerType: SceneTriggerType,
    successMessage: string
  ) => {
    if (!scene) return;
    setConditionSheetOpen(false);
    try {
      await updateSceneMutation.mutateAsync({
        triggerType,
        triggerConfig: {
          schemaVersion: 1,
          deviceBindings: currentDeviceBindings,
          condition,
        },
      });
      Toast.show({ type: "success", text1: successMessage });
    } catch {
      Toast.show({
        type: "error",
        text1: "Condition was not saved",
        text2: "Please try again in a moment.",
      });
    }
  };

  const appendAction = async (
    step: SceneActionStep,
    successMessage: string
  ) => {
    if (!scene) return;
    setActionSheetOpen(false);
    try {
      await updateSceneMutation.mutateAsync({
        actions: {
          ...currentActions,
          steps: [...currentActions.steps, step],
        },
      });
      Toast.show({ type: "success", text1: successMessage });
    } catch {
      Toast.show({
        type: "error",
        text1: "Action was not saved",
        text2: "Please try again in a moment.",
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!sceneId) return;
    setConfirmDelete(false);
    try {
      await deleteSceneMutation.mutateAsync(sceneId);
      Toast.show({ type: "success", text1: "Scene deleted" });
      goBack();
    } catch {
      Toast.show({ type: "error", text1: "Could not delete scene", text2: "Please try again." });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="mx-auto w-full max-w-[430px] flex-1 bg-white">
        <ScreenHeader
          title="Scene Detail"
          onBack={goBack}
          right={
            scene ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Delete scene"
                onPress={() => setConfirmDelete(true)}
              >
                <Trash2 size={22} color={COLORS.coral} strokeWidth={2.2} />
              </Pressable>
            ) : null
          }
        />
        <ScrollView
          className="flex-1 bg-white"
          contentContainerClassName="px-6 pb-12 pt-8"
          showsVerticalScrollIndicator={false}
        >
          {!scene ? (
            <View className="flex-1 items-center justify-center py-24">
              <Text className="text-center text-[16px] font-extrabold" style={{ color: COLORS.muted }}>
                {sceneQuery.isLoading ? "Loading scene..." : "Scene not found"}
              </Text>
            </View>
          ) : (
            <>
              <Text
                className="text-[28px] font-extrabold leading-9"
                style={{ color: COLORS.text }}
              >
                {scene.name}
              </Text>
              <Text className="mt-2 text-[14px] font-semibold leading-5" style={{ color: COLORS.muted }}>
                {scene.isEnabled ? "Enabled" : "Disabled"} | {scene.roomCategory?.name ?? "Whole home"}
              </Text>

              <View className="mt-12">
                <View className="flex-row items-center justify-between">
                  <Text className="text-[24px] font-extrabold leading-8" style={{ color: COLORS.text }}>
                    If
                  </Text>
                  <TouchableOpacity
                    className="h-10 w-10 items-center justify-center rounded-full"
                    style={{ backgroundColor: COLORS.coral }}
                    activeOpacity={0.82}
                    accessibilityRole="button"
                    accessibilityLabel="Add condition"
                    onPress={() => setConditionSheetOpen(true)}
                  >
                    <Plus size={23} color="#FFFFFF" strokeWidth={2.3} />
                  </TouchableOpacity>
                </View>
                <Text className="mt-2 text-[16px] font-semibold leading-6" style={{ color: COLORS.text }}>
                  When any condition is met
                </Text>
                <View className="mt-5 h-px" style={{ backgroundColor: COLORS.line }} />
                {hasCondition ? (
                  <RuleRow
                    icon={triggerIcon(triggerConfig)}
                    title={triggerTitle(triggerConfig)}
                    subtitle={triggerDescription(triggerConfig)}
                    onPress={() => setConditionSheetOpen(true)}
                  />
                ) : (
                  <Text className="py-5 text-[15px] font-semibold leading-5" style={{ color: COLORS.muted }}>
                    No condition yet. Tap plus to add when this scene should run.
                  </Text>
                )}
              </View>

              <View className="mt-12">
                <View className="flex-row items-center justify-between">
                  <Text className="text-[24px] font-extrabold leading-8" style={{ color: COLORS.text }}>
                    Then
                  </Text>
                  <TouchableOpacity
                    className="h-10 w-10 items-center justify-center rounded-full"
                    style={{ backgroundColor: COLORS.coral }}
                    activeOpacity={0.82}
                    accessibilityRole="button"
                    accessibilityLabel="Add action"
                    onPress={() => setActionSheetOpen(true)}
                  >
                    <Plus size={23} color="#FFFFFF" strokeWidth={2.3} />
                  </TouchableOpacity>
                </View>
                <View className="mt-5 h-px" style={{ backgroundColor: COLORS.line }} />
                {actions?.steps?.length ? (
                  actions.steps.map((step, index) => (
                    <RuleRow
                      key={`${step.type}-${index}`}
                      icon={actionIcon(step.type)}
                      title={actionTitle(step)}
                      subtitle={actionDescription(step)}
                    />
                  ))
                ) : (
                  <Text className="py-5 text-[15px] font-semibold" style={{ color: COLORS.muted }}>
                    No saved action yet.
                  </Text>
                )}
              </View>
            </>
          )}
        </ScrollView>
      </View>

      <Modal transparent visible={confirmDelete} animationType="fade" onRequestClose={() => setConfirmDelete(false)}>
        <Pressable className="flex-1 justify-end bg-black/45" onPress={() => setConfirmDelete(false)}>
          <Pressable
            className="rounded-t-[28px] bg-white px-8 pb-10 pt-8"
            onPress={(e) => e.stopPropagation()}
          >
            <Text className="text-[20px] font-extrabold" style={{ color: COLORS.text }}>
              Delete this scene?
            </Text>
            <Text className="mt-2 text-[14px] font-semibold leading-5" style={{ color: COLORS.muted }}>
              This action cannot be undone. The scene and all its rules will be permanently removed.
            </Text>
            <View className="mt-6 flex-row gap-3">
              <Pressable
                className="h-[52px] flex-1 items-center justify-center rounded-[14px] border"
                style={{ borderColor: COLORS.line }}
                onPress={() => setConfirmDelete(false)}
              >
                <Text className="text-[15px] font-extrabold" style={{ color: COLORS.muted }}>Cancel</Text>
              </Pressable>
              <Pressable
                className="h-[52px] flex-1 items-center justify-center rounded-[14px]"
                style={{ backgroundColor: COLORS.coral }}
                disabled={deleteSceneMutation.isPending}
                onPress={() => void handleDeleteConfirm()}
              >
                <Text className="text-[15px] font-extrabold text-white">
                  {deleteSceneMutation.isPending ? "Deleting..." : "Delete"}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <RuleBottomSheet
        visible={conditionSheetOpen}
        title="Add Condition"
        onClose={() => setConditionSheetOpen(false)}
      >
        <SheetOption
          title="Fall detected"
          description="Run when DoraShield reports a fall event."
          icon={<Bell size={25} color={COLORS.coral} strokeWidth={2.1} />}
          disabled={updateSceneMutation.isPending}
          onPress={() =>
            void updateCondition(
              { kind: "fall_detected", deviceType: "dorashield" },
              "device_status_changes",
              "Condition updated"
            )
          }
        />
        <SheetOption
          title="DoraBot offline"
          description="Run when DoraBot stays offline for 10 minutes."
          icon={<WifiOff size={25} color={COLORS.warning} strokeWidth={2.1} />}
          disabled={updateSceneMutation.isPending}
          onPress={() =>
            void updateCondition(
              {
                kind: "device_offline",
                deviceType: "dorabot",
                durationMinutes: 10,
              },
              "device_status_changes",
              "Condition updated"
            )
          }
        />
        <SheetOption
          title="Schedule"
          description="Example: at 8:00 every morning."
          icon={<Clock3 size={25} color={COLORS.coral} strokeWidth={2.1} />}
          disabled={updateSceneMutation.isPending}
          onPress={() =>
            void updateCondition(
              {
                kind: "schedule",
                deviceType: "dorabot",
                schedule: { frequency: "daily", time: "08:00" },
              },
              "schedule",
              "Condition updated"
            )
          }
        />
      </RuleBottomSheet>

      <RuleBottomSheet
        visible={actionSheetOpen}
        title="Add Action"
        onClose={() => setActionSheetOpen(false)}
      >
        <SheetOption
          title="Send family notification"
          description="Create a Message Center item and push alert."
          icon={<Bell size={25} color={COLORS.coral} strokeWidth={2.1} />}
          disabled={updateSceneMutation.isPending}
          onPress={() =>
            void appendAction(
              {
                type: "send_push_alert",
                target: "caregiver",
                notificationType: "home",
                title: "Family update",
                body: "A scene update was triggered.",
                severity: "normal",
              },
              "Action added"
            )
          }
        />
        <SheetOption
          title="Speak through DoraBot"
          description="Let DoraBot say a check-in or reminder message."
          icon={<MessageCircle size={25} color={COLORS.coral} strokeWidth={2.1} />}
          disabled={updateSceneMutation.isPending}
          onPress={() =>
            void appendAction(
              {
                type: "speak_on_dorabot",
                target: "dorabot",
                message: "Your family is checking in. Are you feeling okay?",
              },
              "Action added"
            )
          }
        />
        <SheetOption
          title="Notify if no response"
          description="Send a follow-up alert if the elder does not respond."
          icon={<WifiOff size={25} color={COLORS.muted} strokeWidth={2.1} />}
          disabled={updateSceneMutation.isPending}
          onPress={() =>
            void appendAction(
              {
                type: "send_push_alert_if_no_response",
                target: "caregiver",
                delayMinutes: 15,
                notificationType: "home",
                title: "No response yet",
                body: "The elder has not responded to the scene yet.",
                severity: "warning",
              },
              "Action added"
            )
          }
        />
      </RuleBottomSheet>
    </SafeAreaView>
  );
}
