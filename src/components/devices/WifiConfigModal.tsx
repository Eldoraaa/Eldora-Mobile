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
      <Text className="mb-2 ml-1 text-xs font-bold text-[#6C7A89]">
        {label}
      </Text>
      <View className="h-[54px] flex-row items-center rounded-2xl border border-white bg-[#F6FAFD] px-4">
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#A0AEC0"
          secureTextEntry={secureTextEntry}
          autoCapitalize="none"
          className="flex-1 py-0 text-[15px] font-semibold text-[#1F2A37]"
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
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        className="flex-1 justify-end bg-black/35"
        behavior="translate-with-padding"
      >
        <Pressable className="flex-1" onPress={onClose} />
        <View className="rounded-t-[34px] bg-white px-5 pb-8 pt-5">
          <View className="mb-6 h-1.5 w-12 self-center rounded-full bg-gray-200" />
          <View className="mb-5 flex-row items-center justify-between">
            <View>
              <Text className="text-xl font-bold text-[#1F2A37]">WiFi</Text>
              <Text className="mt-1 text-sm text-[#7B8794]">{title}</Text>
            </View>
            <View className="h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF7FC]">
              <Wifi size={23} color="#7BA7D4" />
            </View>
          </View>

          <View className="mb-4 rounded-2xl bg-[#EEF7FC] p-4">
            <Text className="text-[12px] font-bold uppercase text-[#5D7184]">
              Hub connection
            </Text>
            <Text className="mt-1 text-sm font-semibold text-[#1F2A37]">
              {targetIp ?? "Local connection unavailable"}
            </Text>
            <Text className="mt-1 text-xs text-[#7B8794]">
              {showWifiPicker
                ? "Choose a scanned network, then enter its password."
                : "Enter the password for the selected network."}
            </Text>
          </View>

          {showWifiPicker ? (
            <View className="mb-4 rounded-2xl bg-[#F8FBFD] px-4 pb-1 pt-4">
              <View className="mb-2 flex-row items-center justify-between">
                <View className="flex-1 pr-3">
                  <Text className="text-[11px] font-bold uppercase text-[#7B8794]">
                    Available WiFi
                  </Text>
                  <Text className="mt-1 text-[13px] font-semibold text-[#1F2A37]">
                    Select the network this hub should use.
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={onRescan}
                  disabled={isScanningWifi || !targetIp}
                  className="rounded-xl bg-white px-3 py-2"
                  activeOpacity={0.82}
                >
                  <Text className="text-[12px] font-bold text-[#2477F2]">
                    {isScanningWifi ? "Scanning" : "Rescan"}
                  </Text>
                </TouchableOpacity>
              </View>

              {isScanningWifi ? (
                <View className="flex-row items-center border-t border-[#EEF3F7] py-3">
                  <ActivityIndicator color="#2477F2" />
                  <Text className="ml-3 text-[13px] font-semibold text-[#7B8794]">
                    Scanning networks near the hub...
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
                  <Text className="text-[13px] font-semibold text-[#7B8794]">
                    {wifiScanError ?? "No networks scanned yet."}
                  </Text>
                </View>
              )}
            </View>
          ) : null}

          <View className="gap-4">
            <View>
              <Text className="mb-2 ml-1 text-xs font-bold text-[#6C7A89]">
                Selected network
              </Text>
              <View className="h-[54px] flex-row items-center rounded-2xl bg-[#F6FAFD] px-4">
                <Wifi size={18} color="#7BA7D4" />
                <Text
                  className="ml-3 flex-1 text-[15px] font-bold text-[#1F2A37]"
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
                    <EyeOff size={18} color="#7B8794" />
                  ) : (
                    <Eye size={18} color="#7B8794" />
                  )}
                </TouchableOpacity>
              }
            />
          </View>

          <View className="mt-6">
            <TouchableOpacity
              onPress={onSubmit}
              disabled={isSendingWifi}
              className="h-14 items-center justify-center rounded-2xl bg-[#2477F2]"
              activeOpacity={0.9}
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
