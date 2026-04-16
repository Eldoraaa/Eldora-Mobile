import React, { useRef, useState } from "react";
import { View, Text, Image, FlatList, useWindowDimensions, Animated } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";

const SLIDES = [
  {
    id: "1",
    title: "Welcome to Eldora",
    description: "A trustworthy companion platform that connects families with simple smart care.",
    image: require("../assets/images/eldora-onboarding.png"),
  },
  {
    id: "2",
    title: "Smart Monitoring",
    description: "Keep track of your loved ones' conditions gently and safely from anywhere.",
    image: require("../assets/images/eldora-onboarding-2.png"),
  },
  {
    id: "3",
    title: "Instant Alerts",
    description: "Receive fast, real-time push notifications when assistance is requested.",
    image: require("../assets/images/eldora-onboarding-3.png"),
  },
];

export default function OnboardingScreen() {
  const { width } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<FlatList>(null);

  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems && viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollToNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      router.push("/welcome" as any);
    }
  };

  const renderItem = ({ item }: { item: typeof SLIDES[0] }) => (
    <View style={{ width }} className="items-center justify-start pt-12">
      <View className="items-center w-full px-6">
        <Image
          source={item.image}
          style={{ width: width - 48, height: 320 }}
          resizeMode="contain"
          className="mb-10"
        />
        <Text className="text-3xl font-bold text-eldora-text text-center mb-4 leading-tight">
          {item.title}
        </Text>
        <Text className="text-base text-eldora-text-muted text-center leading-relaxed px-4">
          {item.description}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-eldora-surface">
      <View className="flex-1">
        <FlatList
          data={SLIDES}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          bounces={false}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
            useNativeDriver: false,
          })}
          scrollEventThrottle={32}
          onViewableItemsChanged={viewableItemsChanged}
          viewabilityConfig={viewConfig}
          ref={slidesRef}
        />
      </View>


      <View className="px-6 pb-8 pt-4 justify-end">

        <View className="flex-row justify-center items-center mb-8">
          {SLIDES.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 20, 8],
              extrapolate: "clamp",
            });
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: "clamp",
            });

            return (
              <Animated.View
                key={i.toString()}
                style={[{ width: dotWidth, opacity }]}
                className="h-2 rounded-full bg-eldora-coral mx-1.5"
              />
            );
          })}
        </View>


        <Button
          title={currentIndex === SLIDES.length - 1 ? "Get Started" : "Next"}
          onPress={scrollToNext}
        />
      </View>
    </SafeAreaView>
  );
}
