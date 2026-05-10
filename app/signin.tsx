import React from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  Image,
  TextInput,
} from "react-native";
import Toast from "react-native-toast-message";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/stores/authStore";
import { authService } from "@/services/authService";
import { Redirect, router } from "expo-router";
import { ChevronLeft, Lock, Mail } from "lucide-react-native";

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function SigninScreen() {
  const { width } = useWindowDimensions();
  const { token, setAuth, setLoading, isLoading } = useAuthStore();

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
        text1: "Login Failed",
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
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          className="flex-1 flex-grow"
          contentContainerClassName="pt-4 px-8 pb-8"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          <TouchableOpacity 
            onPress={() => router.back()} 
            className="w-10 h-10 justify-center mb-2 -ml-2"
          >
            <ChevronLeft color="#111827" size={28} />
          </TouchableOpacity>


          <View className="items-center justify-center mb-8">
            <Image
              source={require("../assets/images/login_character.jpg")}
              style={{ width: width * 0.7, height: width * 0.6 }}
              resizeMode="contain"
            />
          </View>


          <View className="mb-8">
            <Text className="text-[28px] font-bold text-gray-900 mb-2">
              Welcome back
            </Text>
            <Text className="text-gray-500 text-[15px] leading-relaxed pr-4">
              Please enter your details to sign in and continue your logistics journey.
            </Text>
          </View>


          <View className="gap-5 mt-2">

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-1.5 ml-1">Email Address</Text>
                  <View className={`flex-row items-center bg-[#F9FAFB] border ${errors.email ? 'border-red-400' : 'border-gray-200'} rounded-lg h-14 px-4`}>
                    <Mail size={20} color="#9ca3af" className="mr-3" />
                    <TextInput
                      placeholder="Enter your email"
                      placeholderTextColor="#9ca3af"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      className="flex-1 bg-transparent text-[15px] font-medium text-gray-900 py-0"
                    />
                  </View>
                  {errors.email?.message ? (
                    <Text className="text-red-500 text-xs mt-1">{errors.email.message}</Text>
                  ) : null}
                </View>
              )}
            />


            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-1.5 ml-1">Password</Text>
                  <View className={`flex-row items-center bg-[#F9FAFB] border ${errors.password ? 'border-red-400' : 'border-gray-200'} rounded-lg h-14 px-4`}>
                    <Lock size={20} color="#9ca3af" className="mr-3" />
                    <TextInput
                      placeholder="Enter password"
                      placeholderTextColor="#9ca3af"
                      secureTextEntry
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      className="flex-1 bg-transparent text-[15px] font-medium text-gray-900 py-0"
                    />
                  </View>
                  {errors.password?.message ? (
                    <Text className="text-red-500 text-xs mt-1">{errors.password.message}</Text>
                  ) : null}
                </View>
              )}
            />
          </View>


          <TouchableOpacity className="items-end mt-4 mb-8">
            <Text className="text-eldora-coral font-bold text-xs">
              Forgot Password?
            </Text>
          </TouchableOpacity>


          <Button
            title="Login"
            onPress={handleSubmit(onSubmit)}
            isLoading={isLoading}
            className="h-14 w-full shadow-lg shadow-red-500/30 rounded-xl"
          />


          <View className="flex-row justify-center mt-12 mb-4">
            <Text className="text-gray-500 text-xs font-medium">
              New to Eldora?{" "}
            </Text>
            <TouchableOpacity onPress={() => router.push("/signup")}>
              <Text className="text-eldora-coral font-bold text-xs">Register</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
