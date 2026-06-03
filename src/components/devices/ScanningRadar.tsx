import React, { useEffect, useRef } from "react";
import { Animated, View } from "react-native";
import { COLORS } from "@/constants/theme";

export function ScanningRadar() {
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(rotate, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      })
    );

    loop.start();

    return () => loop.stop();
  }, [rotate]);

  const spin = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View className="mr-3 mt-1 h-7 w-7 items-center justify-center">
      <View className="absolute h-7 w-7 rounded-full bg-[#FFF4F1]" />
      <Animated.View
        className="h-6 w-6 rounded-full border-[2.5px]"
        style={{
          borderColor: COLORS.coralSoft,
          borderTopColor: COLORS.coral,
          borderRightColor: COLORS.coral,
          transform: [{ rotate: spin }],
        }}
      />
      <View className="absolute h-2 w-2 rounded-full bg-white" />
    </View>
  );
}
