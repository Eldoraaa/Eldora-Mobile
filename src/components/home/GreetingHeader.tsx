import React from "react";
import { View, Text } from "react-native";
import { getGreeting } from "@/utils/formatters";

interface GreetingHeaderProps {
  userName: string;
}

export const GreetingHeader = ({ userName }: GreetingHeaderProps) => {
  const greeting = getGreeting();
  const firstName = userName.split(" ")[0];

  return (
    <View>
      <Text className="text-sm text-eldora-text-muted font-medium">
        {greeting},
      </Text>
      <Text className="text-2xl font-bold text-eldora-text mt-0.5">
        {firstName} 👋
      </Text>
    </View>
  );
};
