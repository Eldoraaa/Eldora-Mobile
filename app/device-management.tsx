import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import {
  ArrowUp,
  Eye,
  EyeOff,
  Router as RouterIcon,
} from "lucide-react-native";
import { DeviceManagementAction } from "@/components/devices/DeviceManagementAction";
import { DeviceManagementRow } from "@/components/devices/DeviceManagementRow";
import {
  useDevicesScreenQuery,
  useUpdateDeviceManagementMutation,
} from "@/hooks/useDeviceQueries";
import { useBackNavigation } from "@/hooks/useBackNavigation";
import { EldoraDevice } from "@/types/device.types";
import { reorderDevices } from "@/utils/device.utils";

export default function DeviceManagementScreen() {
  const goBack = useBackNavigation("/home");
  const devicesScreenQuery = useDevicesScreenQuery();
  const updateDeviceManagementMutation = useUpdateDeviceManagementMutation();
  const fetchedDevices = useMemo(
    () => devicesScreenQuery.data?.devices ?? [],
    [devicesScreenQuery.data?.devices]
  );
  const [devices, setDevices] = useState<EldoraDevice[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const hasSelection = selectedIds.size > 0;
  const selectedHidden = devices.some(
    (device) => selectedIds.has(device.id) && hiddenIds.has(device.id)
  );

  useEffect(() => {
    setDevices(fetchedDevices);
  }, [fetchedDevices]);

  const toggleSelected = (deviceId: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(deviceId)) next.delete(deviceId);
      else next.add(deviceId);
      return next;
    });
  };

  const moveSelectedToTop = () => {
    setDevices((current) => [
      ...current.filter((device) => selectedIds.has(device.id)),
      ...current.filter((device) => !selectedIds.has(device.id)),
    ]);
  };

  const toggleHidden = () => {
    setHiddenIds((current) => {
      const next = new Set(current);
      selectedIds.forEach((id) => {
        if (selectedHidden) next.delete(id);
        else next.add(id);
      });
      return next;
    });
  };

  const saveManagement = async () => {
    try {
      await updateDeviceManagementMutation.mutateAsync({
        devices: devices.map((device, index) => ({
          id: device.id,
          sortOrder: index,
          isHidden: hiddenIds.has(device.id),
          roomCategoryId: device.roomCategory?.id ?? null,
        })),
      });
      goBack();
    } catch {
      Toast.show({
        type: "error",
        text1: "Could not save device order",
        text2: "Your local changes are still visible on this screen.",
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="mx-auto w-full max-w-[430px] flex-1 bg-white">
        <View className="h-[72px] flex-row items-center px-5">
          <Pressable
            className="h-11 w-[74px] justify-center"
            accessibilityRole="button"
            onPress={goBack}
          >
            <Text className="text-[17px] font-medium text-[#5F6B7A]">
              Cancel
            </Text>
          </Pressable>
          <Text className="flex-1 text-center text-[22px] font-extrabold leading-7 text-[#17202A]">
            All Devices
          </Text>
          <Pressable
            className="h-11 w-[74px] items-end justify-center"
            accessibilityRole="button"
            onPress={saveManagement}
            disabled={updateDeviceManagementMutation.isPending}
          >
            {updateDeviceManagementMutation.isPending ? (
              <ActivityIndicator color="#D95545" />
            ) : (
              <Text className="text-[17px] font-extrabold text-[#D95545]">
                Done
              </Text>
            )}
          </Pressable>
        </View>

        {devicesScreenQuery.isPending ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color="#D95545" />
            <Text className="mt-4 text-[15px] font-semibold text-[#5F6B7A]">
              Loading devices...
            </Text>
          </View>
        ) : devices.length > 0 ? (
          <ScrollView
            className="flex-1 bg-white"
            contentContainerClassName={`${hasSelection ? "pb-28" : "pb-8"} pt-5`}
            showsVerticalScrollIndicator={false}
          >
            {devices.map((device, index) => (
              <DeviceManagementRow
                key={device.id}
                device={device}
                index={index}
                selected={selectedIds.has(device.id)}
                hidden={hiddenIds.has(device.id)}
                onToggle={() => toggleSelected(device.id)}
                onDrop={(fromIndex, toIndex) =>
                  setDevices((current) =>
                    reorderDevices(current, fromIndex, toIndex)
                  )
                }
              />
            ))}
          </ScrollView>
        ) : (
          <View className="flex-1 items-center justify-center px-8">
            <RouterIcon size={52} color="#8E97A3" strokeWidth={1.8} />
            <Text className="mt-6 text-center text-[18px] font-extrabold leading-6 text-[#5F6B7A]">
              No devices yet
            </Text>
            <Text className="mt-3 text-center text-[15px] font-semibold leading-6 text-[#5F6B7A]">
              Pair Eldora Core first, then manage the order here.
            </Text>
          </View>
        )}

        {hasSelection ? (
          <View className="h-[88px] flex-row items-center border-t border-[#F1F1F1] bg-white px-4">
            <DeviceManagementAction
              Icon={ArrowUp}
              label="Move to Top"
              disabled={false}
              onPress={moveSelectedToTop}
            />
            <DeviceManagementAction
              Icon={selectedHidden ? Eye : EyeOff}
              label={selectedHidden ? "Show" : "Hide"}
              disabled={false}
              onPress={toggleHidden}
            />
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}
