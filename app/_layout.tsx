import "../global.css";
import { useEffect } from "react";
import { Stack } from "expo-router";
import { useAuthStore } from "@/stores/authStore";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { setupNotificationListeners } from "@/utils/notifications";

export default function RootLayout() {
  const { token, isHydrated } = useAuthStore();

  useEffect(() => {
    const cleanup = setupNotificationListeners();
    return cleanup;
  }, []);

  if (!isHydrated) {
    return <LoadingSpinner />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!token}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={!!token}>
        <Stack.Screen name="(main)" />
      </Stack.Protected>
    </Stack>
  );
}
