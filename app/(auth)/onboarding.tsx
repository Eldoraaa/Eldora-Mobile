import React from "react";
import { View, Text, ScrollView } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";
import { BenefitCard } from "@/components/onboarding/BenefitCard";

const BENEFITS = [
  {
    icon: "📡",
    title: "Pemantauan Real-time",
    description:
      "Pantau kondisi orang tua dari mana saja melalui perangkat Eldora",
  },
  {
    icon: "🔔",
    title: "Alert Cepat",
    description:
      "Terima notifikasi segera saat orang tua membutuhkan bantuan",
  },
  {
    icon: "❤️",
    title: "Tetap Terhubung",
    description:
      "Jaga koneksi dengan keluarga meskipun terpisah jarak",
  },
];

export default function OnboardingScreen() {
  return (
    <SafeAreaView className="flex-1 bg-eldora-base">
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-8"
        showsVerticalScrollIndicator={false}
      >
        {/* Hero area */}
        <View className="items-center pt-12 pb-8 px-6">
          <View className="w-32 h-32 rounded-full bg-eldora-coral-light items-center justify-center mb-6">
            <Text className="text-6xl">🏠</Text>
          </View>
          <Text className="text-3xl font-bold text-eldora-text text-center mb-3">
            Selamat Datang{"\n"}di Eldora
          </Text>
          <Text className="text-base text-eldora-text-muted text-center leading-6 px-4">
            Platform pendamping orang tua yang menghubungkan keluarga dengan cepat dan penuh kepedulian
          </Text>
        </View>

        {/* Benefit cards */}
        <View className="px-5 gap-3 mb-10">
          {BENEFITS.map((benefit, index) => (
            <BenefitCard key={index} {...benefit} />
          ))}
        </View>

        {/* CTA */}
        <View className="px-5">
          <Button
            title="Mulai Sekarang"
            onPress={() => router.push("/(auth)/login")}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
