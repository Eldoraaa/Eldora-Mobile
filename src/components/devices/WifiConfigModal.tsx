import React from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { Eye, EyeOff, Wifi } from "lucide-react-native";
import { COLORS } from "@/constants/theme";
import { WifiNetwork } from "@/types/device.types";
import { WifiNetworkRow } from "./WifiNetworkRow";

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  right?: React.ReactNode;
};

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  right,
}: FieldProps) {
  return (
    <View>
      <Text className="mb-2 ml-1 text-xs font-bold text-[#5F6B7A]">
        {label}
      </Text>
      <View className="h-[54px] flex-row items-center rounded-2xl border border-white bg-[#FAF7F2] px-4">
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.disabled}
          secureTextEntry={secureTextEntry}
          autoCapitalize="none"
          className="flex-1 py-0 text-[15px] font-semibold text-[#17202A]"
          accessibilityLabel={label}
          returnKeyType="done"
        />
        {right}
      </View>
    </View>
  );
}

type WifiConfigModalProps = {
  visible: boolean;
  title: string;
  targetIp: string | null;
  showWifiPicker: boolean;
  wifiNetworks: WifiNetwork[];
  isScanningWifi: boolean;
  wifiScanError: string | null;
  ssid: string;
  password: string;
  showPassword: boolean;
  isSendingWifi: boolean;
  onClose: () => void;
  onRescan: () => void;
  onSelectNetwork: (ssid: string) => void;
  onPasswordChange: (password: string) => void;
  onTogglePassword: () => void;
  onSubmit: () => void;
};

export function WifiConfigModal({
  visible,
  title,
  targetIp,
  showWifiPicker,
  wifiNetworks,
  isScanningWifi,
  wifiScanError,
  ssid,
  password,
  showPassword,
  isSendingWifi,
  onClose,
  onRescan,
  onSelectNetwork,
  onPasswordChange,
  onTogglePassword,
  onSubmit,
}: WifiConfigModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      accessibilityViewIsModal
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        className="flex-1 justify-end bg-black/35"
        behavior="translate-with-padding"
      >
        <Pressable className="flex-1" onPress={onClose} />
        <View className="rounded-t-[28px] bg-white px-5 pb-8 pt-5" accessibilityRole="summary" accessibilityLabel="WiFi setup form">
          <View className="mb-6 h-1.5 w-12 self-center rounded-full bg-gray-200" />
          <View className="mb-5 flex-row items-center justify-between">
            <View>
              <Text className="text-xl font-bold text-[#17202A]">WiFi</Text>
              <Text className="mt-1 text-sm text-[#5F6B7A]">{title}</Text>
            </View>
            <View className="h-12 w-12 items-center justify-center rounded-2xl bg-[#FFE7E2]">
              <Wifi size={23} color={COLORS.coral} />
            </View>
          </View>

          <View className="mb-4 rounded-2xl bg-[#FAF7F2] p-4">
            <Text className="text-[12px] font-bold uppercase text-[#5F6B7A]">
              Hub connection
            </Text>
            <Text className="mt-1 text-sm font-semibold text-[#17202A]">
              {targetIp ?? "Local connection unavailable"}
            </Text>
            <Text className="mt-1 text-xs text-[#5F6B7A]">
              {showWifiPicker
                ? "Choose a scanned network, then enter its password."
                : "Enter the password for the selected network."}
            </Text>
          </View>

          {showWifiPicker ? (
            <View className="mb-4 rounded-2xl bg-[#FAF7F2] px-4 pb-1 pt-4">
              <View className="mb-2 flex-row items-center justify-between">
                <View className="flex-1 pr-3">
                  <Text className="text-[11px] font-bold uppercase text-[#5F6B7A]">
                    Available WiFi
                  </Text>
                  <Text className="mt-1 text-[13px] font-semibold text-[#17202A]">
                    Select the network Eldora Core should use.
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={onRescan}
                  disabled={isScanningWifi || !targetIp}
                  className="rounded-xl bg-white px-3 py-2"
                  activeOpacity={0.82}
                  accessibilityRole="button"
                  accessibilityLabel="Refresh WiFi networks"
                  accessibilityState={{ disabled: isScanningWifi || !targetIp, busy: isScanningWifi }}
                >
                  <Text className="text-[12px] font-bold text-[#D95545]">
                    {isScanningWifi ? "Checking" : "Refresh"}
                  </Text>
                </TouchableOpacity>
              </View>

              {isScanningWifi ? (
                <View className="flex-row items-center border-t border-[#EEF3F7] py-3">
                  <ActivityIndicator color={COLORS.coral} />
                  <Text className="ml-3 text-[13px] font-semibold text-[#5F6B7A]">
                    Checking networks near Eldora Core...
                  </Text>
                </View>
              ) : wifiNetworks.length > 0 ? (
                wifiNetworks.map((network) => (
                  <WifiNetworkRow
                    key={`modal-${network.ssid}-${network.channel ?? "auto"}`}
                    network={network}
                    onPress={() => onSelectNetwork(network.ssid)}
                  />
                ))
              ) : (
                <View className="border-t border-[#EEF3F7] py-3">
                  <Text className="text-[13px] font-semibold text-[#5F6B7A]">
                    {wifiScanError ?? "No networks loaded yet."}
                  </Text>
                </View>
              )}
            </View>
          ) : null}

          <View className="gap-4">
            <View>
              <Text className="mb-2 ml-1 text-xs font-bold text-[#5F6B7A]">
                Selected network
              </Text>
              <View className="h-[54px] flex-row items-center rounded-2xl bg-[#FAF7F2] px-4">
                <Wifi size={18} color={COLORS.coral} />
                <Text
                  className="ml-3 flex-1 text-[15px] font-bold text-[#17202A]"
                  numberOfLines={1}
                >
                  {ssid || "Choose a WiFi network first"}
                </Text>
              </View>
            </View>
            <Field
              label="Password"
              value={password}
              onChangeText={onPasswordChange}
              placeholder="WiFi password"
              secureTextEntry={!showPassword}
              right={
                <TouchableOpacity
                  onPress={onTogglePassword}
                  className="h-9 w-9 items-center justify-center"
                  accessibilityLabel={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} color={COLORS.muted} />
                  ) : (
                    <Eye size={18} color={COLORS.muted} />
                  )}
                </TouchableOpacity>
              }
            />
          </View>

          <View className="mt-6">
            <TouchableOpacity
              onPress={onSubmit}
              disabled={isSendingWifi}
              className="h-14 items-center justify-center rounded-2xl bg-[#D95545]"
              activeOpacity={0.9}
              accessibilityRole="button"
              accessibilityLabel="Send WiFi configuration"
              accessibilityState={{ disabled: isSendingWifi, busy: isSendingWifi }}
            >
              {isSendingWifi ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="font-bold text-white">Send</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
