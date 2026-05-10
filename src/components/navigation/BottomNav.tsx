import React, { useEffect } from "react";
import { BackHandler, Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { Home, LucideIcon, Router as RouterIcon } from "lucide-react-native";

export type BottomNavRoute = "home" | "devices";

type BottomNavProps = {
  active: BottomNavRoute;
  bordered?: boolean;
};

const ICON_SIZE = 25;
const ICON_STROKE_WIDTH = 2.25;

const TABS: Array<{
  route: BottomNavRoute;
  label: string;
  href: "/home" | "/devices";
  Icon: LucideIcon;
}> = [
  { route: "home", label: "Home", href: "/home", Icon: Home },
  { route: "devices", label: "Hub", href: "/devices", Icon: RouterIcon },
];

export function BottomNav({ active, bordered = false }: BottomNavProps) {
  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (active === "home") {
          BackHandler.exitApp();
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
      className={`h-[62px] w-full flex-row items-center bg-white px-4 ${
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
  const color = active ? "#252D36" : "#777873";

  return (
    <Pressable
      className="flex-1 items-center"
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      onPress={onPress}
    >
      <View className="items-center">
        <View className="h-9 w-12 items-center justify-center">
          {active ? (
            <View className="absolute h-8 w-11 rounded-full bg-[#EAF5FB]" />
          ) : null}
          <Icon
            size={ICON_SIZE}
            color={color}
            strokeWidth={ICON_STROKE_WIDTH}
          />
        </View>
        <Text
          className={`mt-[2px] text-[11px] font-semibold leading-4 ${
            active ? "text-[#252D36]" : "text-[#777873]"
          }`}
          numberOfLines={1}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}
