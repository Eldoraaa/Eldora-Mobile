import React from "react";
import { Image, Text, View } from "react-native";

export const LoadingSpinner = () => (
  <View
    className="flex-1 items-center justify-center"
    style={{
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#FFFFFF",
    }}
  >
    <Image
      source={require("../../../assets/images/eldora_logo_nobg.png")}
      style={{ width: 48, height: 48 }}
      resizeMode="contain"
    />
    <Text
      style={{
        marginTop: 16,
        color: "#17202A",
        fontSize: 18,
        fontWeight: "800",
      }}
    >
      Eldora
    </Text>
    <Text
      style={{
        marginTop: 4,
        color: "#5F6B7A",
        fontSize: 11,
        fontWeight: "600",
      }}
    >
      Elderly care, made calmer
    </Text>
    <View
      style={{
        position: "absolute",
        bottom: 58,
        flexDirection: "row",
        gap: 6,
      }}
    >
      <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: "#D95545", opacity: 0.35 }} />
      <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: "#D95545", opacity: 0.65 }} />
      <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: "#D95545", opacity: 0.35 }} />
    </View>
  </View>
);
