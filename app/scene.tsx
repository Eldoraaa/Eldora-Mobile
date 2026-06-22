import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { ChevronDown, Plus } from "lucide-react-native";
import { AddDeviceMenu } from "@/components/devices/AddDeviceMenu";
import { HomeSelectorMenu } from "@/components/home/HomeSelectorMenu";
import { MainTabScreen } from "@/components/navigation/MainTabScreen";
import { SceneEmptyState } from "@/components/scene/SceneEmptyState";
import { SceneFilterPill } from "@/components/scene/SceneFilterPill";
import { SceneListRow } from "@/components/scene/SceneListRow";
import { COLORS } from "@/constants/theme";
import {
  useDevicesScreenQuery,
  useRoomCategoriesQuery,
} from "@/hooks/useDeviceQueries";
import { useSelectedHome } from "@/hooks/useSelectedHome";
import { useScenesQuery } from "@/hooks/useSceneQueries";
import { SceneMode } from "@/types/scene.types";
import { groupScenesByDevice, sceneMatchesRoom } from "@/utils/scene.utils";

export default function SceneScreen() {
  const mode: SceneMode = "automation";
  const [showHomeMenu, setShowHomeMenu] = useState(false);
  const [showDeviceMenu, setShowDeviceMenu] = useState(false);
  const [selectedRoomSlug, setSelectedRoomSlug] = useState("all");
  const {
    homes,
    selectedHome,
    selectedHomeId,
    selectedHomeName,
    setSelectedHomeId,
  } = useSelectedHome();
  const devicesQuery = useDevicesScreenQuery(selectedHomeId);
  const roomCategoriesQuery = useRoomCategoriesQuery(selectedHomeId);
  const managedRoomCategories = (roomCategoriesQuery.data ?? []).filter(
    (room) => room.slug !== "all"
  );
  const roomTabs = [
    { id: "all", name: "All", slug: "all" },
    ...managedRoomCategories.map((room) => ({
      id: room.id,
      name: room.name,
      slug: room.slug,
    })),
  ];
  const selectedRoom = managedRoomCategories.find(
    (room) => room.slug === selectedRoomSlug
  );
  const scenesQuery = useScenesQuery({
    homeId: selectedHomeId,
    mode,
  });
  const scenes = scenesQuery.data ?? [];

  useEffect(() => {
    setSelectedRoomSlug("all");
  }, [selectedHomeId]);
  const devicesById = useMemo(
    () =>
      new Map(
        (devicesQuery.data?.devices ?? []).map((device) => [device.id, device])
      ),
    [devicesQuery.data?.devices]
  );
  const filteredScenes = useMemo(
    () =>
      scenes.filter((scene) =>
        sceneMatchesRoom(
          scene,
          selectedRoomSlug === "all" ? undefined : selectedRoom?.id,
          devicesById
        )
      ),
    [devicesById, scenes, selectedRoom?.id, selectedRoomSlug]
  );
  const sceneGroups = useMemo(
    () => groupScenesByDevice(filteredScenes, devicesById),
    [devicesById, filteredScenes]
  );

  return (
    <MainTabScreen active="scene">
      <ScrollView
        className="flex-1 bg-white"
        contentContainerClassName="pb-10"
        showsVerticalScrollIndicator={false}
      >
        <View className="px-5 pt-5">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              className="flex-row items-center"
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel="Select home"
              accessibilityHint="Open the home selector"
              onPress={() => {
                setShowDeviceMenu(false);
                setShowHomeMenu(true);
              }}
            >
              <Text className="text-[20px] font-semibold leading-7 text-[#5F6B7A]">
                {selectedHomeName}
              </Text>
              <ChevronDown size={18} color="#B8B0A8" />
            </TouchableOpacity>
            <View className="flex-row items-center">
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Open add menu"
                accessibilityHint="Add a device or create a scene"
                onPress={() => {
                  setShowHomeMenu(false);
                  setShowDeviceMenu((value) => !value);
                }}
                className="h-9 w-9 items-center justify-center rounded-full bg-[#D95545]"
                activeOpacity={0.82}
              >
                <Plus size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          <HomeSelectorMenu
            visible={showHomeMenu}
            homes={homes}
            selectedHomeId={selectedHome?.id}
            onSelectHome={(home) => setSelectedHomeId(home.id)}
            onClose={() => setShowHomeMenu(false)}
          />

          <AddDeviceMenu
            visible={showDeviceMenu}
            showCreateScene
            onClose={() => setShowDeviceMenu(false)}
          />

          <View className="mt-8">
            <Text className="text-[18px] font-extrabold leading-6 text-[#17202A]">
              Scheduled reminders
            </Text>
            <Text className="mt-1 text-[13px] font-semibold leading-5 text-[#5F6B7A]">
              Daily and weekly DoraBot messages for the selected home.
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-7"
          >
            {roomTabs.map((room) => (
              <SceneFilterPill
                key={room.id}
                label={room.name}
                active={selectedRoomSlug === room.slug}
                onPress={() => setSelectedRoomSlug(room.slug)}
              />
            ))}
          </ScrollView>
        </View>

        {sceneGroups.length > 0 ? (
          <View className="mt-8">
            {sceneGroups.map((group) => (
              <View key={group.key} className="mb-5">
                <View className="mb-1 px-8">
                  <Text
                    className="text-[13px] font-extrabold uppercase leading-5"
                    style={{ color: COLORS.muted }}
                    numberOfLines={1}
                  >
                    {group.title}
                  </Text>
                  <Text
                    className="mt-0.5 text-[12px] font-semibold leading-4"
                    style={{ color: COLORS.disabled }}
                    numberOfLines={1}
                  >
                    {group.subtitle}
                  </Text>
                </View>
                {group.scenes.map((scene) => (
                  <SceneListRow
                    key={scene.id}
                    scene={scene}
                    devicesById={devicesById}
                    onPress={() => router.push(`/scene-detail?id=${scene.id}` as never)}
                  />
                ))}
              </View>
            ))}
          </View>
        ) : (
          <SceneEmptyState mode={mode} />
        )}
      </ScrollView>
    </MainTabScreen>
  );
}
