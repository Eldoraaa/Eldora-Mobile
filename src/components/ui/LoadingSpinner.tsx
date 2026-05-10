import React from "react";
import { View, ActivityIndicator } from "react-native";

export const LoadingSpinner = () => (
  <View
    className="flex-1 items-center justify-center bg-eldora-base"
    style={{
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#FDF8F5",
    }}
  >
    <ActivityIndicator size="large" color="#FF8A7A" />
  </View>
);
