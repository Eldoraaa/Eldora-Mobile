import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/types/alert.types";
import { formatRelativeTime } from "@/utils/formatters";

interface AlertCardProps {
  alert: Alert;
  onPress?: () => void;
}

export const AlertCard = ({ alert, onPress }: AlertCardProps) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
    <Card className="mb-3">
      <View className="flex-row items-start justify-between">
        <View className="flex-1 mr-3">
          <Text className="text-base font-semibold text-eldora-text mb-1">
            {alert.title}
          </Text>
          <Text
            className="text-sm text-eldora-text-muted"
            numberOfLines={2}
          >
            {alert.description}
          </Text>
        </View>
        <Badge priority={alert.priority} />
      </View>
      <Text className="text-xs text-eldora-text-muted mt-3">
        {formatRelativeTime(alert.createdAt)}
      </Text>
    </Card>
  </TouchableOpacity>
);
