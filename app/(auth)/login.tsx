import React from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { SafeAreaView } from "react-native-safe-area-context";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/stores/authStore";
import { authService } from "@/services/authService";
import { registerFCMToken } from "@/utils/notifications";

const loginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const { setAuth, setLoading, isLoading } = useAuthStore();

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      const response = await authService.login(data);
      setAuth(response.token, response.user);
      // Daftarkan FCM token setelah login berhasil
      await registerFCMToken();
      // Stack.Protected otomatis redirect ke (main)/home
    } catch (err: any) {
      setError("password", {
        message:
          err.response?.data?.message ?? "Email atau password salah",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-eldora-base">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="flex-grow justify-center px-5 py-8"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Hero area */}
          <View className="items-center mb-8">
            <View className="w-24 h-24 rounded-full bg-eldora-coral-light items-center justify-center mb-4">
              <Text className="text-4xl">🔐</Text>
            </View>
            <Text className="text-2xl font-bold text-eldora-text mb-1">
              Masuk ke Eldora
            </Text>
            <Text className="text-sm text-eldora-text-muted text-center">
              Pantau kondisi orang tua Anda kapan saja
            </Text>
          </View>

          {/* Form card */}
          <View
            className="bg-white rounded-3xl p-6"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <Text className="text-xl font-bold text-eldora-text mb-1">
              Masuk
            </Text>
            <Text className="text-sm text-eldora-text-muted mb-6">
              Masukkan email dan password Anda
            </Text>

            <View className="gap-4">
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Email"
                    placeholder="nama@email.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    error={errors.email?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Password"
                    placeholder="Masukkan password"
                    secureTextEntry
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    error={errors.password?.message}
                  />
                )}
              />
            </View>

            <Button
              title="Masuk"
              onPress={handleSubmit(onSubmit)}
              isLoading={isLoading}
              className="mt-6"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
