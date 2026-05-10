import { useCallback, useState, useEffect } from "react";
import { Platform } from "react-native";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import auth from "@react-native-firebase/auth";
import { router } from "expo-router";
import { useAuthStore } from "@/stores/authStore";
import { authService } from "@/services/authService";

const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

export function useGoogleAuth() {
  const { setAuth, setLoading, isLoading } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: GOOGLE_WEB_CLIENT_ID,
      ...(GOOGLE_IOS_CLIENT_ID && GOOGLE_IOS_CLIENT_ID !== "YOUR_IOS_CLIENT_ID_HERE"
        ? { iosClientId: GOOGLE_IOS_CLIENT_ID }
        : {}),
    });
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setError(null);
    setLoading(true);

    try {
      if (
        Platform.OS === "ios" &&
        (!GOOGLE_IOS_CLIENT_ID || GOOGLE_IOS_CLIENT_ID === "YOUR_IOS_CLIENT_ID_HERE")
      ) {
        throw new Error(
          "Google Sign-In on iOS still needs a real EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID or a GoogleService-Info.plist file."
        );
      }

      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const googleIdToken = userInfo.data?.idToken;

      if (!googleIdToken) {
        throw new Error("Failed to get Google token");
      }

      // Sign into Firebase with Google credentials to get a Firebase token
      const googleCredential = auth.GoogleAuthProvider.credential(googleIdToken);
      await auth().signInWithCredential(googleCredential);
      const firebaseToken = await auth().currentUser?.getIdToken();

      if (!firebaseToken) {
        throw new Error("Failed to get Firebase token");
      }

      const loginResponse = await authService.googleLogin(firebaseToken);
      setAuth(loginResponse.token, loginResponse.user);
      router.replace("/home");
    } catch (err: any) {
      if (err.code === "SIGN_IN_CANCELLED" || err.message?.includes("CANCELED")) {
        // User cancelled — do nothing
      } else {
        const message =
          err.response?.data?.message ??
          err.message ??
          "An error occurred during Google sign in";
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }, [setAuth, setLoading]);

  return { signInWithGoogle, isLoading, error };
}
