import { Redirect } from "expo-router";
import { useAuthStore } from "@/stores/authStore";

export default function Index() {
  const { token } = useAuthStore();
  return token ? (
    <Redirect href="/(main)/home" />
  ) : (
    <Redirect href="/(auth)/onboarding" />
  );
}
