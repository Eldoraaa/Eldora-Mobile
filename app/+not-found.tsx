import { Redirect } from "expo-router";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useAuthStore } from "@/stores/authStore";

export default function NotFoundScreen() {
  const { token, isHydrated } = useAuthStore();

  if (!isHydrated) {
    return <LoadingSpinner />;
  }

  return <Redirect href={token ? "/home" : "/onboarding"} />;
}
