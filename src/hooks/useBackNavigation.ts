import { useCallback, useEffect } from "react";
import { BackHandler } from "react-native";
import { router } from "expo-router";

export function goBackOrReplace(fallbackRoute: string) {
  try {
    if (router.canGoBack()) {
      router.back();
      return;
    }
  } catch {
    // Fall through to the explicit fallback route.
  }

  router.replace(fallbackRoute as never);
}

export function useBackNavigation(fallbackRoute: string, enabled = true) {
  const goBack = useCallback(() => {
    goBackOrReplace(fallbackRoute);
  }, [fallbackRoute]);

  useEffect(() => {
    if (!enabled) return;

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        goBack();
        return true;
      }
    );

    return () => subscription.remove();
  }, [enabled, goBack]);

  return goBack;
}
