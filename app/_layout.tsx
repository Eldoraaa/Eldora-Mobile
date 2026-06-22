import "../global.css";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Modal, Platform, Pressable, Vibration, View, Text } from "react-native";
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

type CriticalAlertState = {
  title: string;
  body: string;
  data?: Record<string, unknown>;
};

function openNotificationRoute(data?: Record<string, unknown>) {
  const notificationId = typeof data?.notificationId === "string" ? data.notificationId : null;
  const type = typeof data?.type === "string" ? data.type : undefined;
  if (!notificationId) return;
  router.push(`/alert-detail?id=${notificationId}${type ? `&type=${type}` : ""}` as never);
}

function RootLayoutContent() {
  const { token, isHydrated } = useAuthStore();
  const updateNotificationPreferences = useUpdateNotificationPreferencesMutation();
  const [criticalAlert, setCriticalAlert] = useState<CriticalAlertState | null>(null);
  const criticalAlertIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopCriticalAlert = useCallback(() => {
    if (criticalAlertIntervalRef.current) {
      clearInterval(criticalAlertIntervalRef.current);
      criticalAlertIntervalRef.current = null;
    }
    Vibration.cancel();
    setCriticalAlert(null);
    void Notifications.dismissAllNotificationsAsync();
  }, []);

  const scheduleCriticalNotification = useCallback((alert: CriticalAlertState) => {
    return Notifications.scheduleNotificationAsync({
      content: {
        title: alert.title,
        body: alert.body,
        data: alert.data,
        sound: "default",
      },
      trigger: null,
    });
  }, []);

  const startCriticalAlert = useCallback((alert: CriticalAlertState) => {
    setCriticalAlert(alert);
    Vibration.vibrate([0, 1000, 400, 1000], true);
    void scheduleCriticalNotification(alert);
    if (criticalAlertIntervalRef.current) clearInterval(criticalAlertIntervalRef.current);
    criticalAlertIntervalRef.current = setInterval(() => {
      void scheduleCriticalNotification(alert);
    }, 5000);
  }, [scheduleCriticalNotification]);

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
      stopCriticalAlert();
      openNotificationRoute(response.notification.request.content.data);
    });

    const unsubscribeOpen = messaging().onNotificationOpenedApp((message) => {
      stopCriticalAlert();
      openNotificationRoute(message.data);
    });
    const unsubscribeForeground = messaging().onMessage(async (message) => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
      void queryClient.invalidateQueries({ queryKey: ["home", "safety-summary"] });
      void queryClient.invalidateQueries({ queryKey: ["home", "wellness-summary"] });
      const alertTitle = message.notification?.title ?? "New Eldora alert";
      const alertBody = message.notification?.body ?? "Tap to review the alert.";
      if (message.data?.severity === "critical") {
        startCriticalAlert({ title: alertTitle, body: alertBody, data: message.data });
      } else {
        void Notifications.scheduleNotificationAsync({
          content: {
            title: alertTitle,
            body: alertBody,
            data: message.data,
          },
          trigger: null,
        });
      }
      Toast.show({
        type: message.data?.severity === "critical" ? "error" : "success",
        text1: alertTitle,
        text2: alertBody,
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
      stopCriticalAlert();
    };
  }, [startCriticalAlert, stopCriticalAlert, token]);

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
      <Modal transparent visible={Boolean(criticalAlert)} animationType="fade" accessibilityViewIsModal>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.72)", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <View style={{ width: "100%", borderRadius: 28, backgroundColor: "#FFFFFF", padding: 24, alignItems: "center" }}>
            <View style={{ height: 64, width: 64, borderRadius: 32, backgroundColor: "#FEE2E2", alignItems: "center", justifyContent: "center" }}>
              <AlertTriangle size={34} color="#D95545" strokeWidth={2.4} />
            </View>
            <Text style={{ marginTop: 18, color: "#17202A", fontSize: 24, fontWeight: "800", textAlign: "center" }}>
              {criticalAlert?.title ?? "Critical Eldora alert"}
            </Text>
            <Text style={{ marginTop: 10, color: "#5F6B7A", fontSize: 15, lineHeight: 22, textAlign: "center", fontWeight: "600" }}>
              {criticalAlert?.body ?? "Tap stop when you have handled this alert."}
            </Text>
            <Pressable
              onPress={() => {
                const data = criticalAlert?.data;
                stopCriticalAlert();
                openNotificationRoute(data);
              }}
              style={{ marginTop: 22, height: 54, width: "100%", borderRadius: 18, backgroundColor: "#D95545", alignItems: "center", justifyContent: "center" }}
            >
              <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "800" }}>Open Alert</Text>
            </Pressable>
            <Pressable
              onPress={stopCriticalAlert}
              style={{ marginTop: 12, height: 50, width: "100%", borderRadius: 18, borderWidth: 1, borderColor: "#E5E7EB", alignItems: "center", justifyContent: "center" }}
            >
              <Text style={{ color: "#5F6B7A", fontSize: 15, fontWeight: "800" }}>Stop Alert</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
