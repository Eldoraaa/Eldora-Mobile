import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import Toast from "react-native-toast-message";
import { ChevronLeft } from "lucide-react-native";
import { AddRoomModal } from "@/components/rooms/AddRoomModal";
import { RoomRow } from "@/components/rooms/RoomRow";
import { COLORS } from "@/constants/theme";
import {
  useCreateRoomCategoryMutation,
  useDeleteRoomCategoryMutation,
  useDevicesScreenQuery,
  useRoomCategoriesQuery,
  useUpdateRoomCategoriesMutation,
} from "@/hooks/useDeviceQueries";
import { useBackNavigation } from "@/hooks/useBackNavigation";
import { useSelectedHome } from "@/hooks/useSelectedHome";
import { RoomCategory } from "@/types/device.types";
import { reorderRooms } from "@/utils/room.utils";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function RoomManagementScreen() {
  const params = useLocalSearchParams<{ homeId?: string }>();
  const { selectedHomeId } = useSelectedHome();
  const homeId = params.homeId ?? selectedHomeId;
  const goBack = useBackNavigation("/home-management");
  const roomCategoriesQuery = useRoomCategoriesQuery(homeId);
  const devicesScreenQuery = useDevicesScreenQuery(homeId);
  const createRoomMutation = useCreateRoomCategoryMutation(homeId);
  const updateRoomsMutation = useUpdateRoomCategoriesMutation(homeId);
  const deleteRoomMutation = useDeleteRoomCategoryMutation(homeId);
  const fetchedRooms = useMemo(
    () => (roomCategoriesQuery.data ?? []).filter((room) => room.slug !== "all"),
    [roomCategoriesQuery.data]
  );
  const devices = devicesScreenQuery.data?.devices ?? [];
  const [rooms, setRooms] = useState<RoomCategory[]>([]);
  const [editing, setEditing] = useState(false);
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [roomName, setRoomName] = useState("");

  useEffect(() => {
    setRooms(fetchedRooms);
  }, [fetchedRooms]);

  const deviceCountByRoom = useMemo(() => {
    const counts = new Map<string, number>();
    devices.forEach((device) => {
      const roomId = device.roomCategory?.id;
      if (roomId) counts.set(roomId, (counts.get(roomId) ?? 0) + 1);
    });
    return counts;
  }, [devices]);

  const saveRooms = async () => {
    try {
      await updateRoomsMutation.mutateAsync({
        rooms: rooms.map((room, index) => ({
          id: room.id,
          sortOrder: index * 10 + 10,
        })),
      });
      setEditing(false);
    } catch {
      Toast.show({
        type: "error",
        text1: "Could not save rooms",
      });
    }
  };

  const addRoom = async () => {
    const name = roomName.trim();
    if (!name) return;

    try {
      const room = await createRoomMutation.mutateAsync({ name });
      setRooms((current) => [...current, room]);
      setRoomName("");
      setShowAddRoom(false);
    } catch {
      Toast.show({
        type: "error",
        text1: "Could not add room",
        text2: "The room may already exist.",
      });
    }
  };

  const moveRoom = (fromIndex: number, toIndex: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setRooms((current) => reorderRooms(current, fromIndex, toIndex));
  };

  const deleteRoom = async (room: RoomCategory) => {
    if (room.isDefault) {
      Toast.show({
        type: "error",
        text1: "Default room cannot be deleted",
      });
      return;
    }

    try {
      await deleteRoomMutation.mutateAsync(room.id);
      setRooms((current) => current.filter((item) => item.id !== room.id));
    } catch {
      Toast.show({
        type: "error",
        text1: "Could not delete room",
      });
    }
  };

  const isBusy =
    roomCategoriesQuery.isPending ||
    updateRoomsMutation.isPending ||
    createRoomMutation.isPending ||
    deleteRoomMutation.isPending;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="mx-auto w-full max-w-[430px] flex-1 bg-white">
        <View className="h-[72px] flex-row items-center px-5">
          {editing ? (
            <Pressable
              className="h-11 w-[74px] justify-center"
              accessibilityRole="button"
              accessibilityLabel="Cancel room editing"
              onPress={() => {
                setRooms(fetchedRooms);
                setEditing(false);
              }}
            >
              <Text className="text-[16px] font-semibold leading-6 text-[#5F6B7A]">
                Cancel
              </Text>
            </Pressable>
          ) : (
            <Pressable
              className="h-11 w-[74px] justify-center"
              accessibilityRole="button"
              accessibilityLabel="Go back"
              onPress={goBack}
            >
              <ChevronLeft size={30} color={COLORS.text} strokeWidth={2.4} />
            </Pressable>
          )}

          <Text
            className="flex-1 text-center text-[22px] font-extrabold leading-7"
            style={{ color: COLORS.text }}
          >
            {editing ? "Manage Rooms" : "Room Management"}
          </Text>

          <Pressable
            className="h-11 w-[74px] items-end justify-center"
            accessibilityRole="button"
            accessibilityLabel={editing ? "Save room changes" : "Edit rooms"}
            accessibilityState={{ disabled: isBusy, busy: isBusy }}
            onPress={editing ? saveRooms : () => setEditing(true)}
            disabled={isBusy}
          >
            {isBusy && editing ? (
              <ActivityIndicator color="#D95545" />
            ) : (
              <Text
                className="text-[16px] font-extrabold leading-6"
                style={{ color: COLORS.coral }}
              >
                {editing ? "Done" : "Edit"}
              </Text>
            )}
          </Pressable>
        </View>

        {roomCategoriesQuery.isPending ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={COLORS.coral} />
          </View>
        ) : (
          <ScrollView
            className="flex-1 bg-white"
            contentContainerClassName="pb-12 pt-8"
            showsVerticalScrollIndicator={false}
          >
            {rooms.map((room, index) => (
              <RoomRow
                key={room.id}
                room={room}
                index={index}
                editing={editing}
                count={deviceCountByRoom.get(room.id) ?? room.deviceCount ?? 0}
                onDelete={() => deleteRoom(room)}
                onDragMove={moveRoom}
              />
            ))}

            {!editing ? (
              <TouchableOpacity
                className="ml-8 mt-10 py-4"
                activeOpacity={0.78}
                accessibilityRole="button"
                accessibilityLabel="Add room"
                onPress={() => setShowAddRoom(true)}
              >
                <Text
                  className="text-[16px] font-extrabold leading-6"
                  style={{ color: COLORS.coral }}
                >
                  Add Room
                </Text>
              </TouchableOpacity>
            ) : null}
          </ScrollView>
        )}
      </View>

      <AddRoomModal
        visible={showAddRoom}
        roomName={roomName}
        isPending={createRoomMutation.isPending}
        onChangeRoomName={setRoomName}
        onSubmit={addRoom}
        onClose={() => {
          setRoomName("");
          setShowAddRoom(false);
        }}
      />
    </SafeAreaView>
  );
}
