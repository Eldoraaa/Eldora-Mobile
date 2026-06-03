import React from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenHeader } from "@/components/navigation/ScreenHeader";
import { NotificationPreferenceRow } from "@/components/settings/NotificationPreferenceRow";
import { COLORS } from "@/constants/theme";
import { useBackNavigation } from "@/hooks/useBackNavigation";
import {
  useNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
} from "@/hooks/useNotificationQueries";

export default function NotificationSettingsScreen() {
  const goBack = useBackNavigation("/account");
  const { data: preferences } = useNotificationPreferencesQuery();
  const updatePreferences = useUpdateNotificationPreferencesMutation();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="mx-auto w-full max-w-[430px] flex-1 bg-white">
        <ScreenHeader title="Notification Settings" onBack={goBack} />

        <ScrollView
          className="flex-1 bg-white"
          contentContainerClassName="pb-12 pt-8"
          showsVerticalScrollIndicator={false}
        >
          <Text
            className="px-8 pb-4 pt-4 text-[15px] font-semibold leading-5"
            style={{ color: COLORS.muted }}
          >
            System
          </Text>

          <NotificationPreferenceRow
            title="System Notifications"
            subtitle="Allow Eldora to send push notifications."
            toggleValue={preferences?.systemNotificationEnabled ?? true}
            onToggle={(value) =>
              updatePreferences.mutate({ systemNotificationEnabled: value })
            }
          />
          <NotificationPreferenceRow
            title="Do Not Disturb"
            subtitle="Pause notifications during your saved quiet hours."
            toggleValue={preferences?.dndEnabled ?? false}
            onToggle={(value) => updatePreferences.mutate({ dndEnabled: value })}
          />

          <Text
            className="px-8 pb-4 pt-8 text-[15px] font-semibold leading-5"
            style={{ color: COLORS.muted }}
          >
            Alerts
          </Text>

          <NotificationPreferenceRow
            title="Fall Alert"
            subtitle="Notify when AegisWear detects a fall."
            toggleValue={preferences?.fallAlertEnabled ?? true}
            onToggle={(value) =>
              updatePreferences.mutate({ fallAlertEnabled: value })
            }
          />
          <NotificationPreferenceRow
            title="SOS Alert"
            subtitle="Notify when an elder manually asks for help."
            toggleValue={preferences?.sosAlertEnabled ?? true}
            onToggle={(value) => updatePreferences.mutate({ sosAlertEnabled: value })}
          />
          <NotificationPreferenceRow
            title="Home Alerts"
            subtitle="Notify for home updates and caregiver activity."
            toggleValue={preferences?.homeAlertEnabled ?? true}
            onToggle={(value) => updatePreferences.mutate({ homeAlertEnabled: value })}
          />
          <NotificationPreferenceRow
            title="Pairing Request"
            subtitle="Notify when a device asks to join your home."
            toggleValue={preferences?.pairingRequestAlertEnabled ?? true}
            onToggle={(value) =>
              updatePreferences.mutate({ pairingRequestAlertEnabled: value })
            }
          />

          <Text
            className="px-8 pb-4 pt-8 text-[15px] font-semibold leading-5"
            style={{ color: COLORS.muted }}
          >
            Device Status
          </Text>

          <NotificationPreferenceRow
            title="Device Offline"
            subtitle="Notify when Eldora Core or AegisWear disconnects."
            toggleValue={preferences?.deviceOfflineAlertEnabled ?? true}
            onToggle={(value) =>
              updatePreferences.mutate({ deviceOfflineAlertEnabled: value })
            }
          />
          <NotificationPreferenceRow
            title="Low Battery"
            subtitle="Notify when a device reports low battery."
            toggleValue={preferences?.lowBatteryAlertEnabled ?? true}
            onToggle={(value) =>
              updatePreferences.mutate({ lowBatteryAlertEnabled: value })
            }
          />
          <NotificationPreferenceRow
            title="Care Bulletin"
            subtitle="Receive non-urgent Eldora care summaries."
            toggleValue={preferences?.bulletinEnabled ?? true}
            onToggle={(value) => updatePreferences.mutate({ bulletinEnabled: value })}
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
