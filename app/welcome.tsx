import React, { useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  SafeAreaView,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import { GoogleIcon } from "@/components/icons/GoogleIcon";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";

export default function WelcomeScreen() {
  const { width } = useWindowDimensions();
  const { signInWithGoogle, isLoading, error } = useGoogleAuth();

  useEffect(() => {
    if (error) {
      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2: error,
      });
    }
  }, [error]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center pt-8 px-6">
        <Image
          source={require("../assets/images/eldora-welcome.png")}
          style={{ width: width - 40, height: width - 40 }}
          resizeMode="contain"
        />
      </View>

      <View className="px-6 pb-12 pt-4">
        <Text className="text-[32px] font-extrabold text-gray-900 leading-tight mb-3 pr-4">
          Everything you need is in one place
        </Text>

        <Text className="text-sm text-gray-500 mb-8 leading-relaxed pr-6">
          Find all the necessary monitor alerts and health tracking tools
          seamlessly integrated. Caregiving has never been easier.
        </Text>

        <View className="gap-4">
          <TouchableOpacity
            className="w-full h-14 bg-eldora-coral rounded-lg flex-row items-center justify-center shadow-lg shadow-red-500/20"
            onPress={signInWithGoogle}
            disabled={isLoading}
            style={{ opacity: isLoading ? 0.7 : 1 }}
          >
            {isLoading ? (
              <ActivityIndicator color="white" className="mr-3" />
            ) : (
              <View className="bg-white rounded-full p-1 mr-3">
                <GoogleIcon width={18} height={18} />
              </View>
            )}
            <Text className="text-sm font-bold text-white">
              {isLoading ? "Signing in..." : "Sign in with Google"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="w-full h-14  rounded-lg flex-row items-center justify-center border border-black"
            onPress={() => router.push("/signup")}
            disabled={isLoading}
          >
            <Text className="text-sm font-bold">Create an Account</Text>
          </TouchableOpacity>
        </View>


        <View className="flex-row justify-center mt-6">
          <Text className="text-gray-500 text-xs font-medium">
            Want to login manually?{" "}
          </Text>
          <TouchableOpacity onPress={() => router.push("/signin")}>
            <Text className="text-eldora-coral font-bold text-xs">Sign in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

