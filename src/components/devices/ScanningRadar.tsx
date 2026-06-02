import React, { useEffect, useRef } from "react";
import { Animated, View } from "react-native";
import { COLORS } from "@/constants/theme";

export function ScanningRadar() {
  const pulse = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );
    const rotateLoop = Animated.loop(
      Animated.timing(rotate, {
        toValue: 1,
        duration: 1900,
        useNativeDriver: true,
      })
    );

    pulseLoop.start();
    rotateLoop.start();

    return () => {
      pulseLoop.stop();
      rotateLoop.stop();
    };
  }, [pulse, rotate]);

  const outerScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.45, 1.25],
  });
  const outerOpacity = pulse.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [0.35, 0.14, 0],
  });
  const spin = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View className="mr-4 mt-1 h-10 w-10 items-center justify-center">
      <Animated.View
        className="absolute h-9 w-9 rounded-full"
        style={{
          borderColor: COLORS.coral,
          borderWidth: 1.5,
          opacity: outerOpacity,
          transform: [{ scale: outerScale }],
        }}
      />
      <View
        className="absolute h-8 w-8 rounded-full"
        style={{ borderColor: COLORS.coralSoft, borderWidth: 1.5 }}
      />
      <View
        className="absolute h-5 w-5 rounded-full"
        style={{ borderColor: COLORS.coralSoft, borderWidth: 1 }}
      />
      <Animated.View
        className="h-8 w-8"
        style={{ transform: [{ rotate: spin }] }}
      >
        <View className="h-8 w-8">
          <View
            className="absolute left-[15px] top-[2px] h-[15px] w-[2px] rounded-full"
            style={{
              backgroundColor: COLORS.coral,
              opacity: 0.95,
            }}
          />
          <View
            className="absolute left-[16px] top-[6px] h-0 w-0"
            style={{
              borderLeftWidth: 11,
              borderTopWidth: 8,
              borderBottomWidth: 8,
              borderLeftColor: COLORS.coralSoft,
              borderTopColor: "transparent",
              borderBottomColor: "transparent",
              opacity: 0.85,
            }}
          />
        </View>
      </Animated.View>
      <View
        className="absolute h-[7px] w-[7px] rounded-full"
        style={{ backgroundColor: COLORS.coral }}
      />
    </View>
  );
}
