import React, { useEffect } from "react";
import { BackHandler, Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import {
  CheckSquare,
  Home,
  LucideIcon,
  UserRound,
} from "lucide-react-native";

export type BottomNavRoute = "home" | "scene" | "me";

type BottomNavProps = {
  active: BottomNavRoute;
  bordered?: boolean;
};

const ICON_SIZE = 23;
const ICON_STROKE_WIDTH = 2.15;

const TABS: Array<{
  route: BottomNavRoute;
  label: string;
  href: "/home" | "/scene" | "/settings";
  Icon: LucideIcon;
}> = [
  { route: "home", label: "Home", href: "/home", Icon: Home },
  { route: "scene", label: "Scene", href: "/scene", Icon: CheckSquare },
  { route: "me", label: "Me", href: "/settings", Icon: UserRound },
];

export function BottomNav({ active, bordered = false }: BottomNavProps) {
  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (active === "home") {
          return true;
        } else {
          router.replace("/home" as never);
        }

        return true;
      }
    );

    return () => subscription.remove();
  }, [active]);

  return (
    <View
      className={`h-[72px] w-full flex-row items-center bg-white px-8 ${
        bordered ? "border-t border-[#F1F1F1]" : ""
      }`}
    >
      {TABS.map((tab) => (
        <BottomNavItem
          key={tab.route}
          active={active === tab.route}
          label={tab.label}
          Icon={tab.Icon}
          onPress={() => {
            if (active !== tab.route) router.replace(tab.href as never);
          }}
        />
      ))}
    </View>
  );
}

function BottomNavItem({
  Icon,
  label,
  active,
  onPress,
}: {
  Icon: LucideIcon;
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const color = active ? "#D95545" : "#5F6B7A";

  return (
    <Pressable
      className="flex-1 items-center"
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      onPress={onPress}
    >
      <View className="items-center">
        <View className="h-8 w-12 items-center justify-center">
          <Icon
            size={ICON_SIZE}
            color={color}
            strokeWidth={ICON_STROKE_WIDTH}
          />
        </View>
        <Text
          className={`mt-[2px] text-[12px] font-semibold leading-4 ${
            active ? "text-[#D95545]" : "text-[#5F6B7A]"
          }`}
          numberOfLines={1}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}
