import React from "react";
import { ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenHeader } from "@/components/navigation/ScreenHeader";
import { SceneTriggerOption } from "@/components/scene/SceneTriggerOption";
import { SCENE_TEMPLATES } from "@/constants/sceneTemplates";
import { COLORS } from "@/constants/theme";
import { useBackNavigation } from "@/hooks/useBackNavigation";

const CATEGORY_LABELS = {
  care: "Scene examples",
} as const;

export default function CreateSceneScreen() {
  const goBack = useBackNavigation("/scene");
  const groupedTemplates = Object.entries(CATEGORY_LABELS).map(
    ([category, label]) => ({
      category,
      label,
      templates: SCENE_TEMPLATES.filter(
        (template) => template.category === category
      ),
    })
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="mx-auto w-full max-w-[430px] flex-1 bg-white">
        <ScreenHeader title="Create Scene" onBack={goBack} />
        <ScrollView
          className="flex-1 bg-white"
          contentContainerClassName="pb-12 pt-8"
          showsVerticalScrollIndicator={false}
        >
          <Text
            className="px-8 text-[16px] font-semibold leading-6"
            style={{ color: COLORS.muted }}
          >
            Choose a scene example, select the device that runs it, then review the rule before saving.
          </Text>

          {groupedTemplates.map((group) =>
            group.templates.length > 0 ? (
              <View key={group.category} className="mt-8">
                <Text
                  className="px-8 text-[13px] font-extrabold uppercase"
                  style={{ color: COLORS.muted }}
                >
                  {group.label}
                </Text>
                <View className="mt-2">
                  {group.templates.map((template) => (
                    <SceneTriggerOption
                      key={template.id}
                      title={template.title}
                      description={template.description}
                      Icon={template.Icon}
                      color={template.color}
                      onPress={() =>
                        router.push(
                          `/scene-builder?template=${template.id}` as never
                        )
                      }
                    />
                  ))}
                </View>
              </View>
            ) : null
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
