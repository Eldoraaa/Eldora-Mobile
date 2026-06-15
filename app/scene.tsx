import React, { useMemo, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
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
import { useHomesQuery } from "@/hooks/useHomeManagementQueries";
import { useExecuteSceneMutation, useScenesQuery } from "@/hooks/useSceneQueries";
import { SceneMode } from "@/types/scene.types";
import { groupScenesByDevice, sceneMatchesRoom } from "@/utils/scene.utils";

export default function SceneScreen() {
  const [mode, setMode] = useState<SceneMode>("automation");
  const [showHomeMenu, setShowHomeMenu] = useState(false);
  const [showDeviceMenu, setShowDeviceMenu] = useState(false);
  const [selectedRoomSlug, setSelectedRoomSlug] = useState("all");
  const [selectedHomeId, setSelectedHomeId] = useState<string | null>(null);
  const homesQuery = useHomesQuery();
  const homes = homesQuery.data ?? [];
  const selectedHome = homes.find((h) => h.id === selectedHomeId) ?? homes[0];
  const selectedHomeName = selectedHome?.name ?? "...";
  const devicesQuery = useDevicesScreenQuery();
  const roomCategoriesQuery = useRoomCategoriesQuery(selectedHome?.id);
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
    homeId: selectedHome?.id,
    mode,
  });
  const executeSceneMutation = useExecuteSceneMutation();
  const scenes = scenesQuery.data ?? [];
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

          <View className="mt-8 flex-row items-center">
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Automation scenes"
              accessibilityState={{ selected: mode === "automation" }}
              onPress={() => setMode("automation")}
            >
              <Text
                className={`mr-7 text-[18px] font-extrabold leading-6 ${
                  mode === "automation" ? "text-[#17202A]" : "text-[#5F6B7A]"
                }`}
              >
                Automation
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Tap-to-run scenes"
              accessibilityState={{ selected: mode === "tap" }}
              onPress={() => setMode("tap")}
            >
              <Text
                className={`text-[18px] font-semibold leading-6 ${
                  mode === "tap" ? "text-[#17202A]" : "text-[#5F6B7A]"
                }`}
              >
                Tap-to-Run
              </Text>
            </TouchableOpacity>
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
                    onRun={
                      mode === "tap"
                        ? () =>
                            executeSceneMutation.mutate(scene.id, {
                              onSuccess: () => Toast.show({ type: "success", text1: "Scene executed" }),
                              onError: () => Toast.show({ type: "error", text1: "Scene did not run" }),
                            })
                        : undefined
                    }
                    isRunning={executeSceneMutation.isPending}
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
