import React from "react";
import { View, Text } from "react-native";
import { Card } from "@/components/ui/Card";

interface BenefitCardProps {
  icon: string;
  title: string;
  description: string;
}

export const BenefitCard = ({ icon, title, description }: BenefitCardProps) => (
  <Card className="flex-row items-center gap-4">
    <View className="w-12 h-12 rounded-2xl bg-eldora-coral-light items-center justify-center">
      <Text className="text-2xl">{icon}</Text>
    </View>
    <View className="flex-1">
      <Text className="text-base font-semibold text-eldora-text mb-0.5">
        {title}
      </Text>
      <Text className="text-sm text-eldora-text-muted leading-5">
        {description}
      </Text>
    </View>
  </Card>
);
