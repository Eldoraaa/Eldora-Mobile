import React from "react";
import { Image, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import Toast from "react-native-toast-message";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { SafeAreaView } from "react-native-safe-area-context";
import { Redirect, router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { AuthField } from "@/components/auth/AuthField";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/stores/authStore";
import { authService } from "@/services/authService";
import { useBackNavigation } from "@/hooks/useBackNavigation";

const loginSchema = z.object({
  email: z.string().email("Use a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function SigninScreen() {
  const { width } = useWindowDimensions();
  const { token, setAuth, setLoading, isLoading } = useAuthStore();
  const goBack = useBackNavigation("/welcome");

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      const response = await authService.login(data);
      setAuth(response.token, response.user);
      router.replace("/home");
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Login failed",
        text2: err.response?.data?.message ?? "Invalid email or password",
      });
    } finally {
      setLoading(false);
    }
  };

  if (token) {
    return <Redirect href="/home" />;
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAwareScrollView
        bottomOffset={24}
        extraKeyboardSpace={18}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 12,
          paddingBottom: 32,
        }}
      >
        <TouchableOpacity
          onPress={goBack}
          className="-ml-2 h-11 w-11 items-center justify-center"
          accessibilityLabel="Go back"
          activeOpacity={0.75}
        >
          <ChevronLeft color="#17202A" size={30} />
        </TouchableOpacity>

        <View className="mt-1 items-center">
          <Image
            source={require("../assets/images/login_character.png")}
            style={{
              width: Math.min(260, width * 0.66),
              height: Math.min(220, width * 0.56),
            }}
            resizeMode="contain"
          />
        </View>

        <View className="mt-6">
          <Text className="text-[32px] font-extrabold leading-10 text-eldora-text">
            Welcome back
          </Text>
          <Text className="mt-2 text-[15px] leading-6 text-eldora-text-muted">
            Sign in to view alerts, device status, and wellness updates.
          </Text>
        </View>

        <View className="mt-7 gap-4">
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <AuthField
                label="Email address"
                error={errors.email?.message}
              >
                <TextInput
                  placeholder="name@example.com"
                  placeholderTextColor="#6F7A87"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  textContentType="emailAddress"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  className="flex-1 py-0 text-[15px] font-semibold text-eldora-text"
                />
              </AuthField>
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <AuthField
                label="Password"
                error={errors.password?.message}
              >
                <TextInput
                  placeholder="Enter password"
                  placeholderTextColor="#6F7A87"
                  secureTextEntry
                  autoComplete="current-password"
                  textContentType="password"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  className="flex-1 py-0 text-[15px] font-semibold text-eldora-text"
                />
              </AuthField>
            )}
          />
        </View>

        <TouchableOpacity className="mt-4 items-end" activeOpacity={0.8}>
          <Text className="text-[13px] font-bold text-eldora-coral">
            Forgot password?
          </Text>
        </TouchableOpacity>

        <Button
          title="Sign in"
          onPress={handleSubmit(onSubmit)}
          isLoading={isLoading}
          className="mt-8"
        />

        <View className="mt-8 flex-row justify-center">
          <Text className="text-[13px] font-semibold text-eldora-text-muted">
            New to Eldora?{" "}
          </Text>
          <TouchableOpacity onPress={() => router.push("/signup")}>
            <Text className="text-[13px] font-bold text-eldora-coral">
              Create account
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
