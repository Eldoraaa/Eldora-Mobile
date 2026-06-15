import React from "react";
import { Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { Check, SlidersHorizontal } from "lucide-react-native";
import { COLORS } from "@/constants/theme";

type Home = {
  id: string;
  name: string;
};

type HomeSelectorMenuProps = {
  visible: boolean;
  homes: Home[];
  selectedHomeId?: string;
  onSelectHome: (home: Home) => void;
  onClose: () => void;
};

export function HomeSelectorMenu({
  visible,
  homes,
  selectedHomeId,
  onSelectHome,
  onClose,
}: HomeSelectorMenuProps) {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      accessibilityViewIsModal
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 bg-black/45" onPress={onClose}>
        <View className="mx-auto w-full max-w-[430px]">
          <Pressable
            className="rounded-b-[18px] bg-white px-6 pb-4 pt-12"
            accessibilityRole="menu"
            accessibilityLabel="Home selector"
            onPress={(event) => event.stopPropagation()}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              {homes.map((home) => {
                const selected = home.id === selectedHomeId;
                return (
                  <TouchableOpacity
                    key={home.id}
                    className="h-14 flex-row items-center"
                    activeOpacity={0.78}
                    accessibilityRole="menuitem"
                    accessibilityLabel={home.name}
                    accessibilityState={{ selected }}
                    onPress={() => {
                      onSelectHome(home);
                      onClose();
                    }}
                  >
                    {selected ? (
                      <Check size={20} color={COLORS.coral} />
                    ) : (
                      <View style={{ width: 20 }} />
                    )}
                    <Text
                      className="ml-5 text-[17px]"
                      style={{
                        color: selected ? COLORS.coral : COLORS.text,
                        fontWeight: selected ? "800" : "400",
                      }}
                    >
                      {home.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View className="h-px" style={{ backgroundColor: COLORS.line }} />

            <TouchableOpacity
              className="h-14 flex-row items-center"
              activeOpacity={0.78}
              accessibilityRole="menuitem"
              accessibilityLabel="Home management"
              onPress={() => {
                onClose();
                router.push("/home-management" as never);
              }}
            >
              <SlidersHorizontal size={20} color={COLORS.text} />
              <Text className="ml-5 text-[17px] font-normal" style={{ color: COLORS.text }}>
                Home Management
              </Text>
            </TouchableOpacity>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}
