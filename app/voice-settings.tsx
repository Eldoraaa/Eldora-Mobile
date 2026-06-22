import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { Pause, Play, Volume2 } from "lucide-react-native";
import Toast from "react-native-toast-message";
import { useLocalSearchParams } from "expo-router";
import { ScreenHeader } from "@/components/navigation/ScreenHeader";
import { COLORS } from "@/constants/theme";
import { useBackNavigation } from "@/hooks/useBackNavigation";
import {
  useDeviceVoiceConfigQuery,
  useUpdateDeviceVoiceConfigMutation,
  useDeviceVoiceTestAudioMutation,
} from "@/hooks/useDeviceQueries";
import type { VoiceConfigInput } from "@/api/devicesApi";

const TTS_VOICE_OPTIONS = [
  { group: "Female", value: "en-US-JennyNeural", label: "Jenny", description: "Warm and friendly (US)" },
  { group: "Female", value: "en-US-AriaNeural", label: "Aria", description: "Natural and expressive (US)" },
  { group: "Female", value: "en-GB-SoniaNeural", label: "Sonia", description: "Gentle and clear (UK)" },
  { group: "Female", value: "en-AU-NatashaNeural", label: "Natasha", description: "Calm and steady (Australian)" },
  { group: "Male", value: "en-US-GuyNeural", label: "Guy", description: "Clear and calm (US)" },
  { group: "Male", value: "en-GB-RyanNeural", label: "Ryan", description: "Warm and reassuring (UK)" },
  { group: "Male", value: "en-AU-WilliamNeural", label: "William", description: "Steady and relaxed (Australian)" },
];

const TTS_RATE_OPTIONS = [
  { value: "-20%", label: "Slow", description: "Clearer for hard-of-hearing elders" },
  { value: "-5%", label: "Normal", description: "Default speed" },
  { value: "+10%", label: "Fast", description: "Quicker responses" },
] as const;

function SectionLabel({ children }: { children: string }) {
  return (
    <Text
      className="px-8 pb-4 pt-8 text-[13px] font-extrabold uppercase tracking-wide"
      style={{ color: COLORS.muted }}
    >
      {children}
    </Text>
  );
}

function SelectRow({
  label,
  description,
  selected,
  onPress,
}: {
  label: string;
  description?: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      className="min-h-[64px] flex-row items-center px-8"
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
    >
      <View className="flex-1 pr-4">
        <Text className="text-[16px] font-extrabold leading-6" style={{ color: COLORS.text }}>
          {label}
        </Text>
        {description ? (
          <Text className="mt-0.5 text-[13px] leading-5" style={{ color: COLORS.muted }}>
            {description}
          </Text>
        ) : null}
      </View>
      <View
        className="h-[22px] w-[22px] rounded-full border-2"
        style={{
          backgroundColor: selected ? COLORS.coral : "transparent",
          borderColor: selected ? COLORS.coral : COLORS.line,
        }}
      />
    </Pressable>
  );
}

function Divider() {
  return <View className="mx-8" style={{ height: 1, backgroundColor: COLORS.line }} />;
}

export default function VoiceSettingsScreen() {
  const goBack = useBackNavigation("/home");
  const { deviceId } = useLocalSearchParams<{ deviceId?: string }>();
  const safeDeviceId = deviceId ?? "";

  const configQuery = useDeviceVoiceConfigQuery(safeDeviceId);
  const updateMutation = useUpdateDeviceVoiceConfigMutation(safeDeviceId);
  const testAudioMutation = useDeviceVoiceTestAudioMutation();
  const player = useAudioPlayer(null, { updateInterval: 500, downloadFirst: true });
  const playerStatus = useAudioPlayerStatus(player);

  const cfg = configQuery.data;
  const [localEnabled, setLocalEnabled] = useState<boolean>(true);
  const [previewText, setPreviewText] = useState("Tap Test Voice to preview the selected voice here.");
  const [hasPreviewAudio, setHasPreviewAudio] = useState(false);

  useEffect(() => {
    if (cfg) setLocalEnabled(cfg.enabled);
  }, [cfg]);

  const save = (input: VoiceConfigInput) => {
    updateMutation.mutate(input, {
      onError: () => {
        Toast.show({ type: "error", text1: "Failed to save", text2: "Check your connection." });
      },
    });
  };

  const handleEnabled = (val: boolean) => {
    setLocalEnabled(val);
    save({ enabled: val });
  };

  const handleVoice = (ttsVoice: string) => {
    if (cfg?.ttsVoice === ttsVoice) return;
    save({ ttsVoice });
  };

  const handleRate = (ttsRate: string) => {
    if (cfg?.ttsRate === ttsRate) return;
    save({ ttsRate });
  };

  const testVoice = () => {
    if (!safeDeviceId) return;
    testAudioMutation.mutate(safeDeviceId, {
      onSuccess: (result) => {
        setPreviewText(result.text);
        if (result.audioUrl) {
          player.replace(result.audioUrl);
          player.seekTo(0);
          player.play();
          setHasPreviewAudio(true);
        } else {
          setHasPreviewAudio(false);
          Toast.show({ type: "info", text1: "Voice test sent", text2: "DoraBot will speak in the elder's room." });
        }
      },
      onError: () => {
        Toast.show({ type: "error", text1: "Test failed", text2: "Make sure DoraBot is online." });
      },
    });
  };

  const togglePreviewPlayback = () => {
    if (!hasPreviewAudio) {
      testVoice();
      return;
    }
    if (playerStatus.playing) {
      player.pause();
      return;
    }
    player.seekTo(0);
    player.play();
  };

  if (!safeDeviceId) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="mx-auto w-full max-w-[430px] flex-1 bg-white">
          <ScreenHeader title="Voice Settings" onBack={goBack} />
          <View className="flex-1 items-center justify-center px-8">
            <Volume2 size={48} color={COLORS.disabled} strokeWidth={1.8} />
            <Text className="mt-5 text-center text-[17px] font-extrabold" style={{ color: COLORS.muted }}>
              No device selected
            </Text>
            <Text className="mt-2 text-center text-[13px] leading-5" style={{ color: COLORS.muted }}>
              Open Voice Settings from a DoraBot device detail page.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="mx-auto w-full max-w-[430px] flex-1 bg-white">
        <ScreenHeader title="Voice Settings" onBack={goBack} />

        {configQuery.isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={COLORS.coral} />
          </View>
        ) : (
          <>
          <ScrollView
            className="flex-1 bg-white"
            contentContainerClassName="pb-36"
            showsVerticalScrollIndicator={false}
          >
            {/* Enable Voice */}
            <SectionLabel>DoraBot Voice</SectionLabel>
            <View className="flex-row items-center px-8 py-4">
              <View className="flex-1 pr-4">
                <Text className="text-[16px] font-extrabold" style={{ color: COLORS.text }}>
                  Voice Responses
                </Text>
                <Text className="mt-0.5 text-[13px] leading-5" style={{ color: COLORS.muted }}>
                  DoraBot speaks replies aloud to the elder.
                </Text>
              </View>
              <Switch
                value={localEnabled}
                onValueChange={handleEnabled}
                trackColor={{ false: COLORS.line, true: COLORS.coral }}
                thumbColor="white"
              />
            </View>
            <Divider />

            {/* TTS Voice */}
            <SectionLabel>Voice Character</SectionLabel>
            {(["Female", "Male"] as const).map((group) => (
              <View key={group}>
                <Text
                  className="px-8 pb-2 pt-4 text-[12px] font-extrabold uppercase tracking-widest"
                  style={{ color: COLORS.coral }}
                >
                  {group}
                </Text>
                {TTS_VOICE_OPTIONS.filter((o) => o.group === group).map((opt) => (
                  <SelectRow
                    key={opt.value}
                    label={opt.label}
                    description={opt.description}
                    selected={cfg?.ttsVoice === opt.value}
                    onPress={() => handleVoice(opt.value)}
                  />
                ))}
              </View>
            ))}
            <Divider />

            {/* Speed */}
            <SectionLabel>Speech Speed</SectionLabel>
            {TTS_RATE_OPTIONS.map((opt) => (
              <SelectRow
                key={opt.value}
                label={opt.label}
                description={opt.description}
                selected={cfg?.ttsRate === opt.value}
                onPress={() => handleRate(opt.value)}
              />
            ))}
            <Divider />

            {updateMutation.isPending ? (
              <Text className="mt-6 text-center text-[12px]" style={{ color: COLORS.muted }}>
                Saving changes...
              </Text>
            ) : null}
          </ScrollView>

          <View
            className="absolute bottom-0 left-0 right-0 border-t bg-white px-6 pb-6 pt-4"
            style={{ borderColor: COLORS.line }}
          >
            <View className="mb-3 rounded-[20px] px-4 py-3" style={{ backgroundColor: COLORS.surfaceMuted }}>
              <Text className="text-[12px] font-extrabold uppercase" style={{ color: COLORS.muted }}>
                Voice preview
              </Text>
              <Text className="mt-1 text-[13px] font-semibold leading-5" style={{ color: COLORS.text }} numberOfLines={2}>
                {previewText}
              </Text>
            </View>
            <View className="flex-row gap-3">
              <Pressable
                className="h-[56px] flex-1 flex-row items-center justify-center rounded-2xl"
                style={{ backgroundColor: testAudioMutation.isPending ? COLORS.coralSoft : COLORS.coral }}
                accessibilityRole="button"
                accessibilityLabel="Test DoraBot voice"
                disabled={testAudioMutation.isPending}
                onPress={testVoice}
              >
                {testAudioMutation.isPending ? (
                  <ActivityIndicator color={COLORS.coral} />
                ) : (
                  <>
                    <Volume2 size={20} color="#fff" />
                    <Text className="ml-2 text-[16px] font-extrabold text-white">Test Voice</Text>
                  </>
                )}
              </Pressable>
              <Pressable
                className="h-[56px] w-[56px] items-center justify-center rounded-2xl border"
                style={{ borderColor: COLORS.line, backgroundColor: hasPreviewAudio ? COLORS.surfaceMuted : "#fff" }}
                accessibilityRole="button"
                accessibilityLabel={playerStatus.playing ? "Pause voice preview" : "Play voice preview"}
                onPress={togglePreviewPlayback}
              >
                {playerStatus.playing ? (
                  <Pause size={22} color={COLORS.coral} fill={COLORS.coral} />
                ) : (
                  <Play size={22} color={hasPreviewAudio ? COLORS.coral : COLORS.disabled} fill={hasPreviewAudio ? COLORS.coral : COLORS.disabled} />
                )}
              </Pressable>
            </View>
          </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
