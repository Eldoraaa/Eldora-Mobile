import "../global.css";
import React, { useEffect, useRef } from "react";
import { View, Text } from "react-native";
import { Stack, ErrorBoundaryProps } from "expo-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { useAuthStore } from "@/stores/authStore";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { queryClient } from "@/lib/queryClient";
import Toast, { ToastConfig } from "react-native-toast-message";
import { AlertTriangle, CheckCircle, X } from "lucide-react-native";
import { TouchableOpacity } from "react-native";

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

export default function RootLayout() {
  const { token, isHydrated } = useAuthStore();

  if (!isHydrated) {
    return <LoadingSpinner />;
  }

  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  );
}
