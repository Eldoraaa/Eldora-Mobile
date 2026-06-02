import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { Redirect, router } from "expo-router";
import Toast from "react-native-toast-message";
import { GoogleIcon } from "@/components/icons/GoogleIcon";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { useAuthStore } from "@/stores/authStore";

export default function WelcomeScreen() {
  const { width } = useWindowDimensions();
  const { signInWithGoogle, isLoading, error } = useGoogleAuth();
  const { token } = useAuthStore();

  useEffect(() => {
    if (error) {
      Toast.show({
        type: "error",
        text1: "Login failed",
        text2: error,
      });
    }
  }, [error]);

  if (token) {
    return <Redirect href="/home" />;
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 pt-6">
        <View className="flex-row items-center gap-3">
          <Image
            source={require("../assets/images/eldora_logo_nobg.png")}
            className="h-11 w-11"
            resizeMode="contain"
          />
          <View>
            <Text className="text-[20px] font-extrabold text-eldora-text">
              Eldora
            </Text>
            <Text className="text-[12px] font-semibold text-eldora-text-muted">
              Elderly care, made calmer
            </Text>
          </View>
        </View>

        <View className="flex-1 items-center justify-center">
          <Image
            source={require("../assets/images/eldora_welcome.png")}
            style={{
              width: Math.min(334, width * 0.82),
              height: Math.min(334, width * 0.82),
            }}
            resizeMode="contain"
          />
        </View>

        <View className="pb-5">
          <Text className="text-[34px] font-extrabold leading-[42px] text-eldora-text">
            Family care, without the constant worry.
          </Text>
          <Text className="mt-4 text-[15px] leading-6 text-eldora-text-muted">
            Eldora helps you check alerts, device status, and wellness updates
            for the people you love.
          </Text>
        </View>
      </View>

      <View className="gap-3 px-6 pb-9">
        <TouchableOpacity
          className="h-14 flex-row items-center justify-center rounded-2xl bg-eldora-coral"
          onPress={signInWithGoogle}
          disabled={isLoading}
          activeOpacity={0.88}
          style={{ opacity: isLoading ? 0.72 : 1 }}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <View className="mr-3 rounded-full bg-white p-1.5">
                <GoogleIcon width={18} height={18} />
              </View>
              <Text className="text-[15px] font-bold text-white">
                Continue with Google
              </Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          className="h-14 flex-row items-center justify-center rounded-2xl border border-eldora-line bg-white"
          onPress={() => router.push("/signin")}
          disabled={isLoading}
          activeOpacity={0.86}
        >
          <Text className="text-[15px] font-bold text-eldora-text">
            Sign in with email
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="h-11 flex-row items-center justify-center"
          onPress={() => router.push("/signup")}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          <Text className="text-[13px] font-bold text-eldora-text-muted">
            Create account
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
