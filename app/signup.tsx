import React, { useState } from "react";
import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { SafeAreaView } from "react-native-safe-area-context";
import { Redirect, router } from "expo-router";
import Toast from "react-native-toast-message";
import { ChevronLeft } from "lucide-react-native";
import { AuthField } from "@/components/auth/AuthField";
import { Button } from "@/components/ui/Button";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/stores/authStore";
import { useBackNavigation } from "@/hooks/useBackNavigation";

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Use a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  mobile: z.string().min(6, "Mobile number is required"),
});

type SignupForm = z.infer<typeof signupSchema>;

export default function SignupScreen() {
  const { token } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const goBack = useBackNavigation("/welcome");

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "", mobile: "" },
  });

  const onSubmit = async (data: SignupForm) => {
    setIsLoading(true);
    try {
      await authService.register(data);
      Toast.show({
        type: "success",
        text1: "Account created",
        text2: "Sign in to start monitoring Eldora.",
      });
      router.replace("/signin");
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Registration failed",
        text2: err.response?.data?.message ?? "Please try again later.",
      });
    } finally {
      setIsLoading(false);
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
          paddingBottom: 34,
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

        <View className="mt-2">
          <View className="mb-5 flex-row items-center gap-3">
            <Image
              source={require("../assets/images/eldora_logo_nobg.png")}
              className="h-10 w-10"
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

          <Text className="text-[32px] font-extrabold leading-10 text-eldora-text">
            Create account
          </Text>
          <Text className="mt-2 text-[15px] leading-6 text-eldora-text-muted">
            Set up access for alerts, device status, and wellness updates.
          </Text>
        </View>

        <View className="mt-7 gap-4">
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <AuthField
                label="Full name"
                error={errors.name?.message}
              >
                <TextInput
                  placeholder="Your name"
                  placeholderTextColor="#6F7A87"
                  autoCapitalize="words"
                  autoComplete="name"
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
                  placeholder="Minimum 6 characters"
                  placeholderTextColor="#6F7A87"
                  secureTextEntry
                  autoComplete="new-password"
                  textContentType="newPassword"
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
            name="mobile"
            render={({ field: { onChange, onBlur, value } }) => (
              <AuthField
                label="Mobile number"
                error={errors.mobile?.message}
              >
                <TextInput
                  placeholder="Phone number"
                  placeholderTextColor="#6F7A87"
                  keyboardType="phone-pad"
                  autoComplete="tel"
                  textContentType="telephoneNumber"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  className="flex-1 py-0 text-[15px] font-semibold text-eldora-text"
                />
              </AuthField>
            )}
          />
        </View>

        <Text className="mt-5 text-[12px] leading-5 text-eldora-text-muted">
          By creating an account, you agree to use Eldora as a caregiver support
          tool, not a medical diagnosis system.
        </Text>

        <Button
          title="Create account"
          onPress={handleSubmit(onSubmit)}
          isLoading={isLoading}
          className="mt-7"
        />

        <View className="mt-8 flex-row justify-center">
          <Text className="text-[13px] font-semibold text-eldora-text-muted">
            Already joined?{" "}
          </Text>
          <TouchableOpacity onPress={() => router.push("/signin")}>
            <Text className="text-[13px] font-bold text-eldora-coral">
              Sign in
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
