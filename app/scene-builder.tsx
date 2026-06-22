import React, { useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
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
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Pencil,
  Router,
  ShieldCheck,
} from "lucide-react-native";
import { ScreenHeader } from "@/components/navigation/ScreenHeader";
import { findSceneTemplate } from "@/constants/sceneTemplates";
import { COLORS } from "@/constants/theme";
import { useBackNavigation } from "@/hooks/useBackNavigation";
import { useDevicesScreenQuery } from "@/hooks/useDeviceQueries";
import { useSelectedHome } from "@/hooks/useSelectedHome";
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

const SCHEDULE_RULE: RuleOption = {
  label: "Time reminder",
  kind: "schedule",
  triggerType: "schedule",
  deviceType: "dorabot",
};

const ACTION_OPTIONS: ActionOption[] = [
  { label: "Speak on DoraBot", type: "speak_on_dorabot", target: "dorabot" },
];

const WEEKDAYS = [
  { label: "Sun", value: 0 },
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
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
  onPress,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress?: () => void;
}) {
  const Container = onPress ? TouchableOpacity : View;
  return (
    <Container className="flex-row items-center py-5" {...(onPress ? { activeOpacity: 0.78, onPress } : {})}>
      <View className="mr-4 h-[44px] w-[44px] items-center justify-center rounded-[16px]" style={{ backgroundColor: COLORS.surfaceMuted }}>{icon}</View>
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
      {onPress ? <ChevronRight size={20} color={COLORS.disabled} /> : null}
    </Container>
  );
}

export default function SceneBuilderScreen() {
  const params = useLocalSearchParams<{ template?: string }>();
  const template = findSceneTemplate(params.template);
  const createSceneMutation = useCreateSceneMutation();
  const { selectedHome, selectedHomeId } = useSelectedHome();
  const devicesQuery = useDevicesScreenQuery(selectedHomeId);
  const pairedDevices = devicesQuery.data?.devices ?? [];
  const goBackToList = useBackNavigation("/create-scene");

  const [step, setStep] = useState<BuilderStep>("setup");
  const [name, setName] = useState(template?.title ?? "");
  const [deviceBindings, setDeviceBindings] = useState<Partial<Record<BindableDeviceType, string>>>({});
  const [showPreconditionSheet, setShowPreconditionSheet] = useState(false);
  const [selectedActionTypes, setSelectedActionTypes] = useState<SceneActionType[]>(["speak_on_dorabot"]);
  const [scheduleTime, setScheduleTime] = useState("09:00");
  const [scheduleFrequency, setScheduleFrequency] = useState<"daily" | "weekly">("daily");
  const [scheduleWeekday, setScheduleWeekday] = useState(1);
  const [dorabotMessage, setDoraBotMessage] = useState("");

  useEffect(() => {
    setName(template?.title ?? "");
    setStep("setup");
    setScheduleTime(template?.triggerConfig.condition?.schedule?.time ?? "09:00");
    setScheduleFrequency(template?.triggerConfig.condition?.schedule?.frequency ?? "daily");
    setScheduleWeekday(template?.triggerConfig.condition?.schedule?.weekday ?? 1);
    setSelectedActionTypes(["speak_on_dorabot"]);
    const firstDoraBotMessage = template?.actions.steps.find((action) => action.type === "speak_on_dorabot" || action.type === "dorabot_voice_check_in");
    setDoraBotMessage(firstDoraBotMessage?.message ?? "This is your reminder. Please take care of yourself.");
  }, [template]);

  const selectedRule = SCHEDULE_RULE;

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
        kind: "schedule" as const,
        deviceType: "dorabot" as const,
        schedule: {
          frequency: scheduleFrequency,
          time: scheduleTime,
          ...(scheduleFrequency === "weekly" ? { weekday: scheduleWeekday } : {}),
        },
      },
      ...(hasDeviceBindings ? { deviceBindings: cleanedDeviceBindings } : {}),
    }),
    [cleanedDeviceBindings, hasDeviceBindings, scheduleFrequency, scheduleTime, scheduleWeekday]
  );

  const draftActions = useMemo(
    () => ({
      schemaVersion: 1 as const,
      steps: [
        {
          type: "speak_on_dorabot" as const,
          target: "dorabot" as const,
          message: dorabotMessage.trim() || "This is your reminder. Please take care of yourself.",
        },
      ],
      ...(hasDeviceBindings ? { deviceBindings: cleanedDeviceBindings } : {}),
    }),
    [cleanedDeviceBindings, dorabotMessage, hasDeviceBindings]
  );

  const preconditionLabel = scheduleFrequency === "daily"
    ? "Every day"
    : `Every ${WEEKDAYS.find((day) => day.value === scheduleWeekday)?.label ?? "week"}`;

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
        roomCategoryId: null,
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
                Set one time-based reminder. DoraBot will speak your message on the schedule you choose.
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
                  Schedule
                </Text>
                <Text className="mt-2 text-[16px] font-semibold leading-6" style={{ color: COLORS.text }}>
                  Choose when DoraBot should speak this reminder.
                </Text>
                <View className="mt-5">
                  <Text className="mb-2 text-[13px] font-extrabold uppercase" style={{ color: COLORS.muted }}>
                    Time (HH:MM)
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
              </View>

              <View className="mt-12">
                <Text className="text-[24px] font-extrabold leading-8" style={{ color: COLORS.text }}>
                  Message
                </Text>
                <Text className="mt-2 text-[16px] font-semibold leading-6" style={{ color: COLORS.text }}>
                  Write what DoraBot should say at the scheduled time.
                </Text>
                <TextInput
                  value={dorabotMessage}
                  onChangeText={setDoraBotMessage}
                  placeholder="What should DoraBot say?"
                  placeholderTextColor={COLORS.disabled}
                  className="mt-5 min-h-[92px] rounded-[16px] border px-4 py-3 text-[15px] font-semibold"
                  style={{ borderColor: COLORS.line, color: COLORS.text, textAlignVertical: "top" }}
                  accessibilityLabel="DoraBot speech message"
                  multiline
                />
              </View>

              <View className="mt-10">
                <View className="h-px" style={{ backgroundColor: COLORS.line }} />
                <SummaryRow
                  icon={<CalendarDays size={22} color={COLORS.coral} />}
                  title="Precondition"
                  subtitle={preconditionLabel}
                  onPress={() => setShowPreconditionSheet(true)}
                />
              </View>
            </>
          ) : null}
        </ScrollView>

        <Modal
          transparent
          visible={showPreconditionSheet}
          animationType="fade"
          accessibilityViewIsModal
          onRequestClose={() => setShowPreconditionSheet(false)}
        >
          <Pressable className="flex-1 justify-end bg-black/45" onPress={() => setShowPreconditionSheet(false)}>
            <Pressable
              className="rounded-t-[28px] bg-white px-7 pb-8 pt-7"
              accessibilityRole="summary"
              accessibilityLabel="Precondition schedule"
              onPress={(event) => event.stopPropagation()}
            >
              <View className="mb-5 h-1.5 w-12 self-center rounded-full bg-[#E8ECEF]" />
              <Text className="text-center text-[22px] font-extrabold" style={{ color: COLORS.text }}>
                Precondition
              </Text>
              <Text className="mt-2 text-center text-[13px] font-semibold leading-5" style={{ color: COLORS.muted }}>
                Choose when this scene is allowed to run.
              </Text>

              <View className="mt-6 flex-row gap-3">
                {(["daily", "weekly"] as const).map((freq) => {
                  const active = scheduleFrequency === freq;
                  return (
                    <Pressable
                      key={freq}
                      className="h-[58px] flex-1 items-center justify-center rounded-[18px] border"
                      style={{ borderColor: active ? COLORS.coral : COLORS.line, backgroundColor: active ? COLORS.coralSoft : "#fff" }}
                      onPress={() => setScheduleFrequency(freq)}
                    >
                      <Text className="text-[15px] font-extrabold capitalize" style={{ color: active ? COLORS.coral : COLORS.text }}>
                        {freq}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {scheduleFrequency === "weekly" ? (
                <View className="mt-6 flex-row flex-wrap justify-between gap-y-3">
                  {WEEKDAYS.map((day) => {
                    const active = scheduleWeekday === day.value;
                    return (
                      <Pressable
                        key={day.value}
                        className="h-[52px] w-[30%] items-center justify-center rounded-[18px] border"
                        style={{ borderColor: active ? COLORS.coral : COLORS.line, backgroundColor: active ? COLORS.coral : "#fff" }}
                        onPress={() => setScheduleWeekday(day.value)}
                      >
                        <Text className="text-[15px] font-extrabold" style={{ color: active ? "#fff" : COLORS.text }}>
                          {day.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              ) : null}

              <Pressable
                className="mt-7 h-[52px] items-center justify-center rounded-2xl"
                style={{ backgroundColor: COLORS.coral }}
                onPress={() => setShowPreconditionSheet(false)}
              >
                <Text className="text-[15px] font-extrabold text-white">Done</Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>

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
