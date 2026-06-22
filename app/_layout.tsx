import "../global.css";
import React, { useEffect, useRef } from "react";
import { Platform, View, Text } from "react-native";
import { router, Stack, ErrorBoundaryProps } from "expo-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { useAuthStore } from "@/stores/authStore";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useUpdateNotificationPreferencesMutation } from "@/hooks/useNotificationQueries";
import { queryClient } from "@/lib/queryClient";
import Toast, { ToastConfig } from "react-native-toast-message";
import { AlertTriangle, CheckCircle, X } from "lucide-react-native";
import { TouchableOpacity } from "react-native";
import messaging from "@react-native-firebase/messaging";
import * as Notifications from "expo-notifications";

import { Animated } from "react-native";

const AnimatedProgressBar = ({ duration, color }: { duration: number, color: string }) => {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: duration > 0 ? duration : 4000,
      useNativeDriver: false,
    }).start();
  }, [duration, progress]);

  const width = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [340, 0]
  });

  return <Animated.View style={{ height: 4, backgroundColor: color, width }} />;
};

const toastConfig: ToastConfig = {
  success: ({ text1, text2, props, ...rest }: any) => {
    const duration = rest.visibilityTime ?? props?.visibilityTime ?? 4000;
    return (
      <View style={{ width: 340, backgroundColor: "#ffffff", borderRadius: 8, elevation: 5, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, overflow: "hidden" }}>
        <AnimatedProgressBar key={Date.now()} duration={duration} color="#22c55e" />
        <View style={{ flexDirection: "row", padding: 16, alignItems: "center" }}>
          <CheckCircle size={24} color="#22c55e" strokeWidth={2} />
          <View style={{ flex: 1, paddingHorizontal: 12 }}>
            {text1 ? <Text style={{ color: "#1f2937", fontSize: 14, fontWeight: "600" }}>{text1}</Text> : null}
            {text2 ? <Text style={{ color: "#4b5563", fontSize: 13, marginTop: 2 }}>{text2}</Text> : null}
          </View>
          <TouchableOpacity onPress={() => Toast.hide()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <X size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>
      </View>
    );
  },
  error: ({ text1, text2, props, ...rest }: any) => {
    const duration = rest.visibilityTime ?? props?.visibilityTime ?? 4000;
    return (
      <View style={{ width: 340, backgroundColor: "#ffffff", borderRadius: 8, elevation: 5, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, overflow: "hidden" }}>
        <AnimatedProgressBar key={Date.now()} duration={duration} color="#ef4444" />
        <View style={{ flexDirection: "row", padding: 16, alignItems: "center" }}>
          <AlertTriangle size={24} color="#ef4444" strokeWidth={2} />
          <View style={{ flex: 1, paddingHorizontal: 12 }}>
            {text1 ? <Text style={{ color: "#1f2937", fontSize: 14, fontWeight: "600" }}>{text1}</Text> : null}
            {text2 ? <Text style={{ color: "#4b5563", fontSize: 13, marginTop: 2 }}>{text2}</Text> : null}
          </View>
          <TouchableOpacity onPress={() => Toast.hide()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <X size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>
      </View>
    );
  },
};

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#FFFFFF",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
      }}
    >
      <Text style={{ color: "#17202A", fontSize: 22, fontWeight: "700" }}>
        Eldora needs a reload
      </Text>
      <Text
        style={{
          color: "#5F6B7A",
          fontSize: 13,
          lineHeight: 20,
          marginTop: 10,
          textAlign: "center",
        }}
      >
        {error.message}
      </Text>
      <TouchableOpacity
        onPress={retry}
        style={{
          marginTop: 18,
          height: 46,
          paddingHorizontal: 22,
          borderRadius: 16,
          backgroundColor: "#D95545",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ color: "#FFFFFF", fontWeight: "700" }}>Reload</Text>
      </TouchableOpacity>
    </View>
  );
}

function openNotificationRoute(data?: Record<string, unknown>) {
  const notificationId = typeof data?.notificationId === "string" ? data.notificationId : null;
  const type = typeof data?.type === "string" ? data.type : undefined;
  if (!notificationId) return;
  router.push(`/alert-detail?id=${notificationId}${type ? `&type=${type}` : ""}` as never);
}

function RootLayoutContent() {
  const { token, isHydrated } = useAuthStore();
  const updateNotificationPreferences = useUpdateNotificationPreferencesMutation();

  useEffect(() => {
    if (!token) return;

    if (Platform.OS === "android") {
      void Notifications.setNotificationChannelAsync("eldora_alerts", {
        name: "Eldora Alerts",
        importance: Notifications.AndroidImportance.HIGH,
      });
      void Notifications.setNotificationChannelAsync("critical_alerts", {
        name: "Critical Eldora Alerts",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 1000, 250, 1000, 250, 1000],
        enableVibrate: true,
        bypassDnd: true,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      });
    }

    void messaging()
      .registerDeviceForRemoteMessages()
      .then(() => messaging().requestPermission())
      .then((status) => {
        const enabled =
          status === messaging.AuthorizationStatus.AUTHORIZED ||
          status === messaging.AuthorizationStatus.PROVISIONAL;
        if (!enabled) {
          Toast.show({
            type: "error",
            text1: "Notifications are off",
            text2: "Enable notifications so Eldora alerts can reach you.",
          });
          return null;
        }
        return messaging().getToken();
      })
      .then((fcmToken) => {
        if (fcmToken) {
          updateNotificationPreferences.mutate({
            fcmToken,
            fcmPlatform: Platform.OS === "ios" ? "ios" : "android",
          });
        }
      })
      .catch(() => undefined);

    const unsubscribeTokenRefresh = messaging().onTokenRefresh((fcmToken) => {
      updateNotificationPreferences.mutate({
        fcmToken,
        fcmPlatform: Platform.OS === "ios" ? "ios" : "android",
      });
    });

    const notificationSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      openNotificationRoute(response.notification.request.content.data);
    });

    const unsubscribeOpen = messaging().onNotificationOpenedApp((message) => {
      openNotificationRoute(message.data);
    });
    const unsubscribeForeground = messaging().onMessage(async (message) => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
      void queryClient.invalidateQueries({ queryKey: ["home", "safety-summary"] });
      void queryClient.invalidateQueries({ queryKey: ["home", "wellness-summary"] });
      void Notifications.scheduleNotificationAsync({
        content: {
          title: message.notification?.title ?? "New Eldora alert",
          body: message.notification?.body ?? "Tap to review the alert.",
          data: message.data,
        },
        trigger: null,
      });
      Toast.show({
        type: message.data?.severity === "critical" ? "error" : "success",
        text1: message.notification?.title ?? "New Eldora alert",
        text2: message.notification?.body ?? "Tap to review the alert.",
        onPress: () => openNotificationRoute(message.data),
      });
    });

    void messaging()
      .getInitialNotification()
      .then((message) => openNotificationRoute(message?.data));

    return () => {
      notificationSubscription.remove();
      unsubscribeTokenRefresh();
      unsubscribeOpen();
      unsubscribeForeground();
    };
  }, [token]);

  if (!isHydrated) {
    return <LoadingSpinner />;
  }

  return (
    <KeyboardProvider>
      <Stack screenOptions={{ headerShown: false, animation: "none" }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="+not-found" />
        <Stack.Protected guard={!token}>
          <Stack.Screen name="onboarding" options={{ animation: "fade" }} />
          <Stack.Screen name="welcome" options={{ animation: "fade" }} />
          <Stack.Screen name="signin" options={{ animation: "slide_from_right" }} />
          <Stack.Screen name="signup" options={{ animation: "slide_from_right" }} />
        </Stack.Protected>
        <Stack.Protected guard={!!token}>
          <Stack.Screen name="home" options={{ animation: "none" }} />
          <Stack.Screen name="alerts" options={{ animation: "none" }} />
          <Stack.Screen name="alert-detail" options={{ animation: "slide_from_right" }} />
          <Stack.Screen name="add-device" options={{ animation: "slide_from_right" }} />
          <Stack.Screen name="device-setup" options={{ animation: "slide_from_right" }} />
          <Stack.Screen name="device-detail" options={{ animation: "slide_from_right" }} />
          <Stack.Screen name="create-scene" options={{ animation: "slide_from_right" }} />
          <Stack.Screen name="scene-builder" options={{ animation: "slide_from_right" }} />
          <Stack.Screen name="device-management" options={{ animation: "slide_from_right" }} />
          <Stack.Screen name="home-management" options={{ animation: "slide_from_right" }} />
          <Stack.Screen name="home-settings" options={{ animation: "slide_from_right" }} />
          <Stack.Screen name="home-location" options={{ animation: "slide_from_right" }} />
          <Stack.Screen name="home-member" options={{ animation: "slide_from_right" }} />
          <Stack.Screen name="room-management" options={{ animation: "slide_from_right" }} />
          <Stack.Screen name="scene" options={{ animation: "none" }} />
          <Stack.Screen name="settings" options={{ animation: "none" }} />
          <Stack.Screen name="account" options={{ animation: "none" }} />
          <Stack.Screen name="account-security" options={{ animation: "slide_from_right" }} />
          <Stack.Screen name="notification-settings" options={{ animation: "slide_from_right" }} />
          <Stack.Screen name="personal-information" options={{ animation: "slide_from_right" }} />
        </Stack.Protected>
      </Stack>
      <Toast config={toastConfig} position="top" topOffset={60} />
    </KeyboardProvider>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <RootLayoutContent />
    </QueryClientProvider>
  );
}
