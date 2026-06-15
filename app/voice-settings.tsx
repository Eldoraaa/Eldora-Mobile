import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CheckCircle, Volume2 } from "lucide-react-native";
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
  { value: "en-US-JennyNeural", label: "Jenny", description: "Warm and friendly (US)" },
  { value: "en-US-GuyNeural", label: "Guy", description: "Clear and calm (US)" },
  { value: "en-GB-SoniaNeural", label: "Sonia", description: "Gentle and clear (UK)" },
  { value: "en-AU-NatashaNeural", label: "Natasha", description: "Friendly (Australian)" },
] as const;

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
      {selected ? (
        <CheckCircle size={22} color={COLORS.coral} strokeWidth={2.2} />
      ) : (
        <View className="h-[22px] w-[22px] rounded-full border-2" style={{ borderColor: COLORS.line }} />
      )}
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

  const cfg = configQuery.data;
  const [localEnabled, setLocalEnabled] = useState<boolean>(true);

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
        if (result.audioUrl) {
          void Linking.openURL(result.audioUrl).catch(() => {
            Alert.alert("Could not open audio", "Try opening it manually in your browser.");
          });
        } else {
          Toast.show({ type: "info", text1: "Voice test sent", text2: "DoraBot will speak in the elder's room." });
        }
      },
      onError: () => {
        Toast.show({ type: "error", text1: "Test failed", text2: "Make sure DoraBot is online." });
      },
    });
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
          <ScrollView
            className="flex-1 bg-white"
            contentContainerClassName="pb-12"
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
            {TTS_VOICE_OPTIONS.map((opt) => (
              <SelectRow
                key={opt.value}
                label={opt.label}
                description={opt.description}
                selected={cfg?.ttsVoice === opt.value}
                onPress={() => handleVoice(opt.value)}
              />
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

            {/* Test Voice */}
            <SectionLabel>Preview</SectionLabel>
            <View className="px-8">
              <Pressable
                className="h-[56px] items-center justify-center rounded-2xl"
                style={{
                  backgroundColor: testAudioMutation.isPending ? COLORS.coralSoft : COLORS.coral,
                }}
                accessibilityRole="button"
                accessibilityLabel="Test DoraBot voice"
                disabled={testAudioMutation.isPending}
                onPress={testVoice}
              >
                {testAudioMutation.isPending ? (
                  <ActivityIndicator color={COLORS.coral} />
                ) : (
                  <Text className="text-[16px] font-extrabold text-white">Test Voice</Text>
                )}
              </Pressable>
              <Text
                className="mt-3 text-center text-[13px] leading-5"
                style={{ color: COLORS.muted }}
              >
                Plays a sample phrase using the selected voice and speed.
              </Text>
            </View>

            {updateMutation.isPending ? (
              <Text className="mt-6 text-center text-[12px]" style={{ color: COLORS.muted }}>
                Saving changes...
              </Text>
            ) : null}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}
