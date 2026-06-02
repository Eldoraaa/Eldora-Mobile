import React, { useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Image,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { Redirect, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/stores/authStore";

const SLIDES = [
  {
    id: "check-in",
    title: "Know they are okay.",
    description:
      "See the essentials at a glance: device connection, safety status, and the latest family update.",
    image: require("../assets/images/eldora_onboarding.png"),
  },
  {
    id: "urgent-care",
    title: "Act quickly when it matters.",
    description:
      "Fall alerts and urgent device updates are shown clearly, so caregivers can decide the next step fast.",
    image: require("../assets/images/eldora_onboarding_2.png"),
  },
  {
    id: "wellness",
    title: "Follow care over time.",
    description:
      "Short wellness summaries help families notice meaningful changes without turning care into surveillance.",
    image: require("../assets/images/eldora_onboarding_3.png"),
  },
];

export default function OnboardingScreen() {
  const { width } = useWindowDimensions();
  const { token } = useAuthStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<FlatList<(typeof SLIDES)[0]>>(null);

  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems?.length > 0) {
      setCurrentIndex(viewableItems[0].index ?? 0);
    }
  }).current;

  if (token) {
    return <Redirect href="/home" />;
  }

  const scrollToNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
      return;
    }

    router.push("/welcome" as never);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <FlatList
        data={SLIDES}
        horizontal
        pagingEnabled
        bounces={false}
        ref={slidesRef}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 55 }}
        onViewableItemsChanged={viewableItemsChanged}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false },
        )}
        scrollEventThrottle={32}
        renderItem={({ item }) => {
          return (
            <View style={{ width }} className="px-6 pt-8">
              <View className="min-h-[388px] items-center justify-end px-2 pb-3 pt-6">
                <Image
                  source={item.image}
                  style={{ width: "100%", height: Math.min(348, width * 0.86) }}
                  resizeMode="contain"
                />
              </View>

              <Text className="mt-9 text-[32px] font-extrabold leading-10 text-eldora-text">
                {item.title}
              </Text>
              <Text className="mt-4 text-[15px] leading-6 text-eldora-text-muted">
                {item.description}
              </Text>
            </View>
          );
        }}
      />

      <View className="px-6 pb-8 pt-4">
        <View className="mb-7 flex-row justify-center">
          {SLIDES.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 24, 8],
              extrapolate: "clamp",
            });
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.35, 1, 0.35],
              extrapolate: "clamp",
            });

            return (
              <Animated.View
                key={i}
                style={{ width: dotWidth, opacity }}
                className="mx-1 h-2 rounded-full bg-eldora-coral"
              />
            );
          })}
        </View>

        <Button
          title={
            currentIndex === SLIDES.length - 1 ? "Get started" : "Next"
          }
          onPress={scrollToNext}
        />
      </View>
    </SafeAreaView>
  );
}
