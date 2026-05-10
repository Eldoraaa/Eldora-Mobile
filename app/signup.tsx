import React, { useState } from "react";
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
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";
import { Redirect, router } from "expo-router";
import Toast from "react-native-toast-message";
import { ChevronLeft, Lock, Phone, User, Mail } from "lucide-react-native";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/stores/authStore";

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  mobile: z.string().min(6, "Mobile number is required")
});

type SignupForm = z.infer<typeof signupSchema>;

export default function SignupScreen() {
  const { width } = useWindowDimensions();
  const { token } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

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
        text1: "Account Created!",
        text2: "Please sign in with your new account.",
      });
      router.replace("/signin");
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Registration Failed",
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




          <View className="mb-8">
            <Text className="text-[32px] font-bold text-gray-900 mb-2 tracking-tight">
              Let's get you in
            </Text>
            <Text className="text-gray-500 text-[15px] leading-relaxed pr-4">
              Create an account to start managing your deliveries and tracking packages seamlessly.
            </Text>
          </View>


          <View className="gap-5 mt-2">

            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-1.5 ml-1">Full Name</Text>
                  <View className={`flex-row items-center bg-[#F9FAFB] border ${errors.name ? 'border-red-400' : 'border-gray-200'} rounded-lg h-14 px-4`}>
                    <User size={20} color="#9ca3af" className="mr-3" />
                    <TextInput
                      placeholder="Enter your name"
                      placeholderTextColor="#9ca3af"
                      autoCapitalize="words"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      className="flex-1 bg-transparent text-[15px] font-medium text-gray-900 py-0"
                    />
                  </View>
                  {errors.name?.message ? (
                    <Text className="text-red-500 text-xs mt-1">{errors.name.message}</Text>
                  ) : null}
                </View>
              )}
            />


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


            <Controller
              control={control}
              name="mobile"
              render={({ field: { onChange, onBlur, value } }) => (
                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-1.5 ml-1">Mobile Number</Text>
                  <View className={`flex-row items-center bg-[#F9FAFB] border ${errors.mobile ? 'border-red-400' : 'border-gray-200'} rounded-lg h-14 px-4`}>
                    <Phone size={20} color="#9ca3af" className="mr-3" />
                    <TextInput
                      placeholder="Enter mobile number"
                      placeholderTextColor="#9ca3af"
                      keyboardType="phone-pad"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      className="flex-1 bg-transparent text-[15px] font-medium text-gray-900 py-0"
                    />
                  </View>
                  {errors.mobile?.message ? (
                    <Text className="text-red-500 text-xs mt-1">{errors.mobile.message}</Text>
                  ) : null}
                </View>
              )}
            />
          </View>


          <Text className="text-[10px] text-gray-500 leading-relaxed mt-4 mb-6">
            By signing up, you're agree to our <Text className="font-bold text-eldora-coral">Terms & Conditions</Text> and <Text className="font-bold text-eldora-coral">Privacy Policy</Text>
          </Text>


          <Button
            title="Create Account"
            onPress={handleSubmit(onSubmit)}
            isLoading={isLoading}
            className="h-14 w-full shadow-lg shadow-red-500/30 rounded-xl mt-2"
          />


          <View className="flex-row justify-center mt-12 mb-4">
            <Text className="text-gray-500 text-[11px] font-medium">
              Joined us before?{" "}
            </Text>
            <TouchableOpacity onPress={() => router.push("/signin")}>
              <Text className="text-eldora-coral font-bold text-[11px]">Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
