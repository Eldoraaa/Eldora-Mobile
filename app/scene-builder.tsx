import React, { useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import Toast from "react-native-toast-message";
import {
  ChevronLeft,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Pencil,
  Router,
  ShieldCheck,
} from "lucide-react-native";
import { ScreenHeader } from "@/components/navigation/ScreenHeader";
import { findSceneTemplate } from "@/constants/sceneTemplates";
import { COLORS } from "@/constants/theme";
import { useBackNavigation } from "@/hooks/useBackNavigation";
import { useDevicesScreenQuery, useRoomCategoriesQuery } from "@/hooks/useDeviceQueries";
import { useHomesQuery } from "@/hooks/useHomeManagementQueries";
import { useCreateSceneMutation } from "@/hooks/useSceneQueries";
import { EldoraDevice } from "@/types/device.types";
import { SceneActionType, SceneConditionKind, SceneDeviceType } from "@/types/scene.types";

type BuilderStep = "setup" | "device" | "rule";
type BindableDeviceType = Exclude<SceneDeviceType, "any">;

type RuleOption = {
  label: string;
  kind: SceneConditionKind;
  triggerType: "device_status_changes" | "schedule";
  deviceType: SceneDeviceType;
};

type ActionOption = {
  label: string;
  type: SceneActionType;
  target: "caregiver" | "dorabot" | "dorashield";
};

const RULE_OPTIONS: RuleOption[] = [
  { label: "Fall detected", kind: "fall_detected", triggerType: "device_status_changes", deviceType: "dorashield" },
  { label: "Device offline", kind: "device_offline", triggerType: "device_status_changes", deviceType: "any" },
  { label: "Scheduled time", kind: "schedule", triggerType: "schedule", deviceType: "dorabot" },
];

const ACTION_OPTIONS: ActionOption[] = [
  { label: "Send push alert", type: "send_push_alert", target: "caregiver" },
  { label: "Speak on DoraBot", type: "speak_on_dorabot", target: "dorabot" },
  { label: "Activate local alarm", type: "activate_local_alarm", target: "dorashield" },
  { label: "Follow up if no response", type: "send_push_alert_if_no_response", target: "caregiver" },
];

function deviceLooksLike(device: EldoraDevice, deviceName: string) {
  const haystack = `${device.name ?? ""} ${device.deviceId ?? ""}`.toLowerCase();
  if (deviceName === "DoraBot") return haystack.includes("dorabot") || haystack.includes("eldora");
  if (deviceName === "DoraShield") return haystack.includes("dorashield") || haystack.includes("shield") || haystack.includes("vest");
  return false;
}

function deviceBindingKey(deviceName: string): BindableDeviceType | null {
  if (deviceName === "DoraBot") return "dorabot";
  if (deviceName === "DoraShield") return "dorashield";
  return null;
}

function deviceDisplayName(device: EldoraDevice) {
  if (device.name) return device.name;
  return device.deviceId ? `Device ${device.deviceId.slice(-4)}` : "Device";
}

function DeviceRow({
  device,
  selected,
  onPress,
}: {
  device: EldoraDevice;
  selected: boolean;
  onPress: () => void;
}) {
  const isDoraShield = `${device.name} ${device.deviceId}`.toLowerCase().includes("dorashield") || `${device.name} ${device.deviceId}`.toLowerCase().includes("shield");
  const Icon = isDoraShield ? ShieldCheck : Router;

  return (
    <TouchableOpacity
      className="flex-row items-center rounded-[18px] px-3 py-4"
      style={{ backgroundColor: selected ? COLORS.coralSoft : "transparent" }}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`Select ${deviceDisplayName(device)}`}
      onPress={onPress}
    >
      <View
        className="mr-5 h-[48px] w-[48px] items-center justify-center rounded-[16px]"
        style={{ backgroundColor: selected ? "#FFFFFF" : COLORS.surfaceMuted }}
      >
        <Icon size={23} color={selected ? COLORS.coral : COLORS.muted} strokeWidth={2.2} />
      </View>
      <View className="flex-1">
        <Text className="text-[18px] font-extrabold leading-6" style={{ color: selected ? COLORS.coral : COLORS.text }}>
          {deviceDisplayName(device)}
        </Text>
        <Text className="mt-1 text-[13px] font-semibold leading-5" style={{ color: COLORS.muted }}>
          {device.roomCategory?.name ?? "No room"} | {device.isOnline ? "Online" : "Offline"}
        </Text>
      </View>
      {selected ? (
        <CheckCircle2 size={24} color={COLORS.coral} strokeWidth={2.3} />
      ) : (
        <ChevronRight size={24} color={COLORS.disabled} strokeWidth={2.2} />
      )}
    </TouchableOpacity>
  );
}

function SummaryRow({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <View className="flex-row items-center py-5">
      <View className="mr-5 h-[48px] w-[48px] items-center justify-center">{icon}</View>
      <View className="flex-1">
        <Text className="text-[17px] font-extrabold leading-6" style={{ color: COLORS.text }}>
          {title}
        </Text>
        {subtitle ? (
          <Text className="mt-1 text-[13px] font-semibold leading-5" style={{ color: COLORS.muted }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

export default function SceneBuilderScreen() {
  const params = useLocalSearchParams<{ template?: string }>();
  const template = findSceneTemplate(params.template);
  const createSceneMutation = useCreateSceneMutation();
  const homesQuery = useHomesQuery();
  const selectedHome = homesQuery.data?.[0];
  const devicesQuery = useDevicesScreenQuery();
  const pairedDevices = devicesQuery.data?.devices ?? [];
  const roomCategoriesQuery = useRoomCategoriesQuery(selectedHome?.id);
  const goBackToList = useBackNavigation("/create-scene");

  const [step, setStep] = useState<BuilderStep>("setup");
  const [name, setName] = useState(template?.title ?? "");
  const [roomCategoryId, setRoomCategoryId] = useState<string | null>(null);
  const [deviceBindings, setDeviceBindings] = useState<Partial<Record<BindableDeviceType, string>>>({});
  const [selectedRuleLabel, setSelectedRuleLabel] = useState<string | null>(null);
  const [selectedActionTypes, setSelectedActionTypes] = useState<SceneActionType[]>([]);
  const [scheduleTime, setScheduleTime] = useState("09:00");
  const [actionTitle, setActionTitle] = useState("");
  const [actionBody, setActionBody] = useState("");
  const [dorabotMessage, setDoraBotMessage] = useState("");
  const [followUpDelay, setFollowUpDelay] = useState("15");

  useEffect(() => {
    setName(template?.title ?? "");
    setStep("setup");
    const defaultRule = RULE_OPTIONS.find((rule) => rule.kind === template?.triggerConfig.condition?.kind) ?? RULE_OPTIONS[0];
    setSelectedRuleLabel(defaultRule.label);
    setScheduleTime(template?.triggerConfig.condition?.schedule?.time ?? "09:00");
    setSelectedActionTypes((template?.actions.steps ?? []).map((action) => action.type === "dorabot_voice_check_in" ? "speak_on_dorabot" : action.type));
    const firstNotification = template?.actions.steps.find((action) => action.type === "send_push_alert" || action.type === "send_push_alert_if_no_response");
    const firstDoraBotMessage = template?.actions.steps.find((action) => action.type === "speak_on_dorabot" || action.type === "dorabot_voice_check_in");
    const firstFollowUp = template?.actions.steps.find((action) => action.type === "send_push_alert_if_no_response");
    setActionTitle(firstNotification?.title ?? template?.title ?? "Eldora alert");
    setActionBody(firstNotification?.body ?? template?.description ?? "Please check Eldora immediately.");
    setDoraBotMessage(firstDoraBotMessage?.message ?? "Your family is checking in. Are you feeling okay?");
    setFollowUpDelay(String(firstFollowUp?.delayMinutes ?? 15));
  }, [template]);

  const selectedRule = useMemo(
    () => RULE_OPTIONS.find((rule) => rule.label === selectedRuleLabel) ?? RULE_OPTIONS[0],
    [selectedRuleLabel]
  );

  const triggerDeviceNames = useMemo(() => {
    const names = new Set<string>();
    if (selectedRule.deviceType === "dorashield") names.add("DoraShield");
    if (selectedRule.deviceType === "dorabot") names.add("DoraBot");
    if (selectedRule.deviceType === "any") {
      names.add("DoraShield");
      names.add("DoraBot");
    }
    selectedActionTypes.forEach((type) => {
      const action = ACTION_OPTIONS.find((item) => item.type === type);
      if (action?.target === "dorashield") names.add("DoraShield");
      if (action?.target === "dorabot") names.add("DoraBot");
    });
    return Array.from(names);
  }, [selectedActionTypes, selectedRule.deviceType]);

  const triggerDeviceGroups = useMemo(
    () =>
      triggerDeviceNames
        .map((deviceName) => {
          const bindingKey = deviceBindingKey(deviceName);
          if (!bindingKey) return null;
          const matchingDevices = pairedDevices.filter((device) => deviceLooksLike(device, deviceName));
          if (matchingDevices.length === 0) return null;
          return { deviceName, bindingKey, matchingDevices };
        })
        .filter((item): item is NonNullable<typeof item> => Boolean(item)),
    [pairedDevices, triggerDeviceNames]
  );

  const missingDeviceNames = useMemo(
    () =>
      triggerDeviceNames.filter(
        (deviceName) => !pairedDevices.some((device) => deviceLooksLike(device, deviceName))
      ),
    [pairedDevices, triggerDeviceNames]
  );

  const hasMissingDevices = missingDeviceNames.length > 0;

  useEffect(() => {
    setDeviceBindings((current) => {
      const next: Partial<Record<BindableDeviceType, string>> = {};
      let changed = false;

      triggerDeviceGroups.forEach((group) => {
        const currentDeviceId = current[group.bindingKey];
        const stillAvailable = group.matchingDevices.some((device) => device.id === currentDeviceId);
        const nextDeviceId = stillAvailable ? currentDeviceId : group.matchingDevices[0]?.id;
        if (nextDeviceId) next[group.bindingKey] = nextDeviceId;
        if (current[group.bindingKey] !== nextDeviceId) changed = true;
      });

      Object.keys(current).forEach((key) => {
        if (!(key in next)) changed = true;
      });

      return changed ? next : current;
    });
  }, [triggerDeviceGroups]);

  const cleanedDeviceBindings = useMemo(
    () => Object.fromEntries(Object.entries(deviceBindings).filter(([, deviceId]) => Boolean(deviceId))),
    [deviceBindings]
  );

  const hasDeviceBindings = Object.keys(cleanedDeviceBindings).length > 0;

  const draftTriggerConfig = useMemo(
    () => ({
      schemaVersion: 1 as const,
      condition: {
        kind: selectedRule.kind,
        deviceType: selectedRule.deviceType,
        ...(selectedRule.kind === "device_offline" ? { durationMinutes: 10 } : {}),
        ...(selectedRule.kind === "schedule"
          ? { schedule: { frequency: "daily" as const, time: scheduleTime } }
          : {}),
      },
      ...(hasDeviceBindings ? { deviceBindings: cleanedDeviceBindings } : {}),
    }),
    [cleanedDeviceBindings, hasDeviceBindings, scheduleTime, selectedRule]
  );

  const draftActions = useMemo(
    () => ({
      schemaVersion: 1 as const,
      steps: selectedActionTypes.map((type) => {
        const option = ACTION_OPTIONS.find((item) => item.type === type) ?? ACTION_OPTIONS[0];
        if (type === "send_push_alert" || type === "send_push_alert_if_no_response") {
          return {
            type,
            target: option.target,
            notificationType: selectedRule.kind === "fall_detected" ? "alarm" as const : selectedRule.kind === "device_offline" ? "device" as const : "home" as const,
            title: actionTitle.trim() || option.label,
            body: actionBody.trim() || "Please check Eldora immediately.",
            severity: selectedRule.kind === "fall_detected" ? "critical" as const : selectedRule.kind === "device_offline" ? "warning" as const : "normal" as const,
            ...(type === "send_push_alert_if_no_response" ? { delayMinutes: Number(followUpDelay) || 15 } : {}),
          };
        }
        if (type === "speak_on_dorabot" || type === "dorabot_voice_check_in") {
          return {
            type,
            target: option.target,
            message: dorabotMessage.trim() || "Your family is checking in. Are you feeling okay?",
          };
        }
        return { type, target: option.target };
      }),
      ...(hasDeviceBindings ? { deviceBindings: cleanedDeviceBindings } : {}),
    }),
    [actionBody, actionTitle, cleanedDeviceBindings, dorabotMessage, followUpDelay, hasDeviceBindings, selectedActionTypes, selectedRule.kind]
  );

  const selectedRoomName =
    roomCategoryId === null
      ? "Whole home"
      : roomCategoriesQuery.data?.find((room) => room.id === roomCategoryId)?.name ?? "Room";

  const handleBack = () => {
    if (step === "rule") {
      setStep("device");
      return;
    }
    if (step === "device") {
      setStep("setup");
      return;
    }
    goBackToList();
  };

  const handlePrimaryAction = async () => {
    if (!template) return;
    if (step === "setup") {
      setStep("device");
      return;
    }
    if (step === "device") {
      if (hasMissingDevices) {
        Toast.show({
          type: "error",
          text1: "Device required",
          text2: `Pair ${missingDeviceNames.join(" and ")} first.`,
        });
        return;
      }
      setStep("rule");
      return;
    }

    if (selectedActionTypes.length === 0) {
      Toast.show({
        type: "error",
        text1: "Action required",
        text2: "Choose at least one action for this scene.",
      });
      return;
    }

    if (!selectedHome) {
      Toast.show({
        type: "error",
        text1: "Create a home first",
        text2: "A scene must be saved inside an Eldora home.",
      });
      router.replace("/home-management" as never);
      return;
    }

    try {
      const createdScene = await createSceneMutation.mutateAsync({
        homeId: selectedHome.id,
        name: name.trim() || template.title,
        triggerType: selectedRule.triggerType,
        roomCategoryId,
        triggerConfig: draftTriggerConfig,
        actions: draftActions,
      });
      Toast.show({
        type: "success",
        text1: "Scene saved",
        text2: "Review the rule detail before using it.",
      });
      router.replace(`/scene-detail?id=${createdScene.id}` as never);
    } catch {
      Toast.show({
        type: "error",
        text1: "Scene was not created",
        text2: "Please try again in a moment.",
      });
    }
  };

  if (!template) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="mx-auto w-full max-w-[430px] flex-1 bg-white">
          <ScreenHeader title="Create Scene" onBack={goBackToList} />
          <View className="flex-1 items-center justify-center px-8">
            <Text className="text-center text-[20px] font-extrabold" style={{ color: COLORS.muted }}>
              Scene not found
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const Icon = template.Icon;
  const isSaveStep = step === "rule";
  const primaryLabel = createSceneMutation.isPending ? "Saving..." : isSaveStep ? "Save" : "Continue";
  const primaryDisabled = createSceneMutation.isPending;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="mx-auto w-full max-w-[430px] flex-1 bg-white"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        <View className="flex-row items-center justify-between px-5 py-4">
          <TouchableOpacity
            className="h-[50px] w-[50px] items-center justify-center"
            accessibilityRole="button"
            accessibilityLabel="Back"
            onPress={handleBack}
          >
            <ChevronLeft size={30} color={COLORS.text} strokeWidth={2.4} />
          </TouchableOpacity>
          <View className="h-[50px] w-[50px]" />
        </View>

        <ScrollView
          className="flex-1 bg-white"
          contentContainerClassName="px-6 pb-28 pt-6"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {step === "setup" ? (
            <>
              <View className="flex-row items-center">
                <View className="mr-4 h-[54px] w-[54px] items-center justify-center rounded-[18px]" style={{ backgroundColor: COLORS.surfaceMuted }}>
                  <Icon size={27} color={template.color} strokeWidth={2.3} />
                </View>
                <View className="flex-1">
                  <Text className="text-[24px] font-extrabold leading-8" style={{ color: COLORS.text }}>
                    {template.title}
                  </Text>
                  <Text className="mt-1 text-[14px] font-semibold leading-5" style={{ color: COLORS.muted }}>
                    {template.setupNote}
                  </Text>
                </View>
              </View>

              <View className="mt-8">
                <Text className="mb-3 text-[15px] font-extrabold leading-5" style={{ color: COLORS.text }}>
                  Scene name
                </Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Scene name"
                  placeholderTextColor={COLORS.disabled}
                  className="h-[50px] rounded-[12px] border px-4 text-[16px] font-semibold"
                  style={{ borderColor: COLORS.line, color: COLORS.text, backgroundColor: "#FFFFFF" }}
                  maxLength={60}
                  returnKeyType="done"
                  accessibilityLabel="Scene name"
                />
              </View>

              <Text className="mt-5 text-[14px] font-semibold leading-5" style={{ color: COLORS.muted }}>
                The template will save its default IF/THEN rule. You can refine it after saving.
              </Text>
            </>
          ) : null}

          {step === "device" ? (
            <>
              <Text className="text-[28px] font-extrabold leading-9" style={{ color: COLORS.text }}>
                Select device
              </Text>
              <Text className="mt-3 text-[16px] font-semibold leading-6" style={{ color: COLORS.muted }}>
                This device becomes the main trigger for this scene.
              </Text>

              <View className="mt-8">
                {triggerDeviceGroups.map((group) => (
                  <View key={group.deviceName} className="mb-6">
                    <Text className="mb-2 text-[13px] font-extrabold uppercase" style={{ color: COLORS.muted }}>
                      {group.deviceName}
                    </Text>
                    {group.matchingDevices.map((device) => (
                      <DeviceRow
                        key={device.id}
                        device={device}
                        selected={deviceBindings[group.bindingKey] === device.id}
                        onPress={() => {
                          setDeviceBindings((current) => ({
                            ...current,
                            [group.bindingKey]: device.id,
                          }));
                          Toast.show({
                            type: "success",
                            text1: "Device selected",
                            text2: deviceDisplayName(device),
                          });
                        }}
                      />
                    ))}
                  </View>
                ))}
                {hasMissingDevices ? (
                  <View className="rounded-[18px] px-4 py-4" style={{ backgroundColor: COLORS.coralSoft }}>
                    <View className="flex-row items-start">
                      <AlertCircle size={22} color={COLORS.coral} strokeWidth={2.2} />
                      <View className="ml-3 flex-1">
                        <Text className="text-[15px] font-extrabold leading-5" style={{ color: COLORS.text }}>
                          Device not found
                        </Text>
                        <Text className="mt-1 text-[13px] font-semibold leading-5" style={{ color: COLORS.muted }}>
                          Pair {missingDeviceNames.join(" and ")} first so this scene can run.
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      className="mt-4 h-11 items-center justify-center rounded-[14px]"
                      style={{ backgroundColor: COLORS.coral }}
                      activeOpacity={0.82}
                      accessibilityRole="button"
                      accessibilityLabel="Pair required device"
                      onPress={() => router.push("/add-device" as never)}
                    >
                      <Text className="text-[14px] font-extrabold text-white">Pair device</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
              </View>
            </>
          ) : null}

          {step === "rule" ? (
            <>
              <View className="flex-row items-center">
                <Text className="flex-1 text-[28px] font-extrabold leading-9" style={{ color: COLORS.text }}>
                  {name.trim() || template.title}
                </Text>
                <Pencil size={24} color={COLORS.disabled} />
              </View>

              <View className="mt-12">
                <Text className="text-[24px] font-extrabold leading-8" style={{ color: COLORS.text }}>
                  If
                </Text>
                <Text className="mt-2 text-[16px] font-semibold leading-6" style={{ color: COLORS.text }}>
                  Choose what should trigger this scene.
                </Text>
                <View className="mt-5 flex-row flex-wrap gap-2">
                  {RULE_OPTIONS.map((rule) => {
                    const active = selectedRule.label === rule.label;
                    return (
                      <TouchableOpacity
                        key={rule.label}
                        className="rounded-full px-4 py-3"
                        style={{ backgroundColor: active ? COLORS.coralSoft : COLORS.surfaceMuted }}
                        activeOpacity={0.78}
                        accessibilityRole="button"
                        accessibilityState={{ selected: active }}
                        onPress={() => setSelectedRuleLabel(rule.label)}
                      >
                        <Text className="text-[13px] font-extrabold" style={{ color: active ? COLORS.coral : COLORS.text }}>
                          {rule.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                {selectedRule.kind === "schedule" ? (
                  <View className="mt-5">
                    <Text className="mb-2 text-[13px] font-extrabold uppercase" style={{ color: COLORS.muted }}>
                      Schedule time
                    </Text>
                    <TextInput
                      value={scheduleTime}
                      onChangeText={setScheduleTime}
                      placeholder="09:00"
                      placeholderTextColor={COLORS.disabled}
                      className="h-[50px] rounded-[12px] border px-4 text-[16px] font-semibold"
                      style={{ borderColor: COLORS.line, color: COLORS.text }}
                      accessibilityLabel="Schedule time"
                      returnKeyType="done"
                    />
                  </View>
                ) : null}
              </View>

              <View className="mt-12">
                <Text className="text-[24px] font-extrabold leading-8" style={{ color: COLORS.text }}>
                  Then
                </Text>
                <Text className="mt-2 text-[16px] font-semibold leading-6" style={{ color: COLORS.text }}>
                  Choose one or more actions.
                </Text>
                <View className="mt-5 flex-row flex-wrap gap-2">
                  {ACTION_OPTIONS.map((action) => {
                    const active = selectedActionTypes.includes(action.type);
                    return (
                      <TouchableOpacity
                        key={action.type}
                        className="rounded-full px-4 py-3"
                        style={{ backgroundColor: active ? COLORS.coralSoft : COLORS.surfaceMuted }}
                        activeOpacity={0.78}
                        accessibilityRole="button"
                        accessibilityState={{ selected: active }}
                        onPress={() =>
                          setSelectedActionTypes((current) =>
                            active ? current.filter((type) => type !== action.type) : [...current, action.type]
                          )
                        }
                      >
                        <Text className="text-[13px] font-extrabold" style={{ color: active ? COLORS.coral : COLORS.text }}>
                          {action.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                {selectedActionTypes.some((type) => type === "send_push_alert" || type === "send_push_alert_if_no_response") ? (
                  <View className="mt-5 gap-3">
                    <TextInput
                      value={actionTitle}
                      onChangeText={setActionTitle}
                      placeholder="Notification title"
                      placeholderTextColor={COLORS.disabled}
                      className="h-[50px] rounded-[12px] border px-4 text-[15px] font-semibold"
                      style={{ borderColor: COLORS.line, color: COLORS.text }}
                      accessibilityLabel="Notification title"
                    />
                    <TextInput
                      value={actionBody}
                      onChangeText={setActionBody}
                      placeholder="Notification body"
                      placeholderTextColor={COLORS.disabled}
                      className="min-h-[72px] rounded-[12px] border px-4 py-3 text-[15px] font-semibold"
                      style={{ borderColor: COLORS.line, color: COLORS.text, textAlignVertical: "top" }}
                      accessibilityLabel="Notification body"
                      multiline
                    />
                  </View>
                ) : null}
                {selectedActionTypes.includes("speak_on_dorabot") ? (
                  <TextInput
                    value={dorabotMessage}
                    onChangeText={setDoraBotMessage}
                    placeholder="What should DoraBot say?"
                    placeholderTextColor={COLORS.disabled}
                    className="mt-5 min-h-[72px] rounded-[12px] border px-4 py-3 text-[15px] font-semibold"
                    style={{ borderColor: COLORS.line, color: COLORS.text, textAlignVertical: "top" }}
                    accessibilityLabel="DoraBot speech message"
                    multiline
                  />
                ) : null}
                {selectedActionTypes.includes("send_push_alert_if_no_response") ? (
                  <TextInput
                    value={followUpDelay}
                    onChangeText={setFollowUpDelay}
                    placeholder="Follow-up delay in minutes"
                    placeholderTextColor={COLORS.disabled}
                    keyboardType="number-pad"
                    className="mt-5 h-[50px] rounded-[12px] border px-4 text-[15px] font-semibold"
                    style={{ borderColor: COLORS.line, color: COLORS.text }}
                    accessibilityLabel="Follow-up delay in minutes"
                  />
                ) : null}
              </View>

              <View className="mt-10">
                <View className="h-px" style={{ backgroundColor: COLORS.line }} />
                <SummaryRow
                  icon={<View />}
                  title="Precondition"
                  subtitle="All day"
                />
                <SummaryRow
                  icon={<View />}
                  title="Display Area"
                  subtitle={selectedRoomName}
                />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-1">
                  <TouchableOpacity
                    className="mr-3 rounded-full px-5 py-3"
                    style={{
                      backgroundColor: roomCategoryId === null ? COLORS.surfaceMuted : "#FFFFFF",
                      borderColor: roomCategoryId === null ? COLORS.line : "transparent",
                      borderWidth: 1,
                    }}
                    onPress={() => setRoomCategoryId(null)}
                  >
                    <Text className="text-[14px] font-extrabold" style={{ color: roomCategoryId === null ? COLORS.text : COLORS.muted }}>
                      Whole home
                    </Text>
                  </TouchableOpacity>
                  {(roomCategoriesQuery.data ?? []).map((room) => (
                    <TouchableOpacity
                      key={room.id}
                      className="mr-3 rounded-full px-5 py-3"
                      style={{
                        backgroundColor: roomCategoryId === room.id ? COLORS.surfaceMuted : "#FFFFFF",
                        borderColor: roomCategoryId === room.id ? COLORS.line : "transparent",
                        borderWidth: 1,
                      }}
                      onPress={() => setRoomCategoryId(room.id)}
                    >
                      <Text className="text-[14px] font-extrabold" style={{ color: roomCategoryId === room.id ? COLORS.text : COLORS.muted }}>
                        {room.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </>
          ) : null}
        </ScrollView>

        <View
          className="flex-row gap-3 px-6 pb-5 pt-3"
          style={{ borderTopColor: COLORS.line, borderTopWidth: 1 }}
        >
          {step !== "setup" ? (
            <TouchableOpacity
              className="h-[54px] w-[112px] items-center justify-center rounded-[16px] border"
              style={{ borderColor: COLORS.line, backgroundColor: "#FFFFFF" }}
              activeOpacity={0.82}
              disabled={createSceneMutation.isPending}
              accessibilityRole="button"
              accessibilityLabel="Previous step"
              accessibilityState={{ disabled: createSceneMutation.isPending }}
              onPress={handleBack}
            >
              <Text
                className="text-[16px] font-extrabold"
                style={{ color: COLORS.muted }}
              >
                Back
              </Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity
            className="h-[54px] flex-1 items-center justify-center rounded-[16px]"
            style={{ backgroundColor: primaryDisabled ? COLORS.disabled : COLORS.coral }}
            activeOpacity={0.82}
            disabled={primaryDisabled}
            accessibilityRole="button"
            accessibilityLabel={primaryLabel}
            accessibilityState={{ disabled: primaryDisabled }}
            onPress={handlePrimaryAction}
          >
            <Text className="text-[16px] font-extrabold text-white">{primaryLabel}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
