import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import Toast from "react-native-toast-message";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { ChevronLeft, Crosshair, Home } from "lucide-react-native";
import { COLORS } from "@/constants/theme";
import { useBackNavigation } from "@/hooks/useBackNavigation";
import {
  useHomeSettingsQuery,
  useHomesQuery,
  useUpdateHomeMutation,
} from "@/hooks/useHomeManagementQueries";

const DEFAULT_COORDINATE = {
  latitude: -6.2569,
  longitude: 106.6184,
};

function coordinateLabel(latitude: number, longitude: number) {
  return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
}

export default function HomeLocationScreen() {
  const goBack = useBackNavigation("/home-settings");
  const params = useLocalSearchParams<{ homeId?: string }>();
  const homesQuery = useHomesQuery();
  const homeId = params.homeId ?? homesQuery.data?.[0]?.id ?? null;
  const settingsQuery = useHomeSettingsQuery(homeId);
  const updateHomeMutation = useUpdateHomeMutation(homeId);
  const home = settingsQuery.data;

  const initialCoordinate = useMemo(
    () => ({
      latitude: home?.latitude ?? DEFAULT_COORDINATE.latitude,
      longitude: home?.longitude ?? DEFAULT_COORDINATE.longitude,
    }),
    [home?.latitude, home?.longitude]
  );

  const [coordinate, setCoordinate] = useState(initialCoordinate);

  useEffect(() => {
    setCoordinate(initialCoordinate);
  }, [initialCoordinate]);

  const region: Region = {
    ...coordinate,
    latitudeDelta: 0.012,
    longitudeDelta: 0.012,
  };

  const confirmLocation = async () => {
    if (!homeId) return;

    const label =
      home?.locationLabel?.trim() ||
      `Home location (${coordinateLabel(coordinate.latitude, coordinate.longitude)})`;
    const address =
      home?.address?.trim() ??
      coordinateLabel(coordinate.latitude, coordinate.longitude);

    try {
      await updateHomeMutation.mutateAsync({
        locationLabel: label,
        address,
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
      });
      goBack();
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Could not update location",
        text2: error.response?.data?.message ?? "Please try again.",
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="mx-auto w-full max-w-[430px] flex-1 bg-white">
        <View className="h-[64px] flex-row items-center px-5">
          <Pressable
            className="h-11 w-11 items-center justify-center"
            accessibilityRole="button"
            onPress={goBack}
          >
            <ChevronLeft size={30} color={COLORS.text} strokeWidth={2.4} />
          </Pressable>
          <Text
            className="flex-1 text-center text-[22px] font-extrabold"
            style={{ color: COLORS.text }}
          >
            Location
          </Text>
          <Pressable
            className="h-11 w-20 items-center justify-center"
            accessibilityRole="button"
            onPress={confirmLocation}
            disabled={updateHomeMutation.isPending}
          >
            <Text className="text-[18px] font-extrabold text-[#D95545]">
              Confirm
            </Text>
          </Pressable>
        </View>

        {settingsQuery.isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={COLORS.coral} />
          </View>
        ) : (
          <View className="flex-1 overflow-hidden">
            <MapView
              style={{ flex: 1 }}
              initialRegion={region}
              region={region}
              onPress={(event) => {
                setCoordinate(event.nativeEvent.coordinate);
              }}
            >
              <Marker coordinate={coordinate} title={home?.name ?? "Eldora Home"}>
                <View className="h-12 w-12 items-center justify-center rounded-full bg-[#D95545]">
                  <Home size={27} color="#FFFFFF" />
                </View>
              </Marker>
            </MapView>

            <View className="absolute left-4 right-4 top-[48%] rounded-[14px] bg-white px-5 py-4 shadow-sm">
              <Text
                className="text-center text-[16px] leading-6"
                style={{ color: COLORS.text }}
              >
                {home?.address ??
                  coordinateLabel(coordinate.latitude, coordinate.longitude)}
              </Text>
              <Text
                className="mt-1 text-center text-[13px]"
                style={{ color: COLORS.muted }}
              >
                Tap the map to adjust home location
              </Text>
            </View>

            <Pressable
              className="absolute bottom-8 right-7 h-14 w-14 items-center justify-center rounded-full bg-[#6B6B6B]"
              accessibilityRole="button"
              onPress={() => setCoordinate(initialCoordinate)}
            >
              <Crosshair size={28} color="#FFFFFF" />
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
