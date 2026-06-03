import React from "react";
import { TouchableOpacity, Text, ActivityIndicator, View } from "react-native";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost";
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

export const Button = ({
  title,
  onPress,
  variant = "primary",
  isLoading,
  disabled,
  className,
  icon,
}: ButtonProps) => {
  const baseClass =
    "rounded-2xl py-4 px-6 items-center justify-center min-h-[54px]";

  const variantClass = {
    primary: "bg-eldora-coral active:opacity-80",
    secondary: "bg-white border border-eldora-line active:opacity-80",
    ghost: "bg-transparent",
  }[variant];

  const textClass = {
    primary: "text-white",
    secondary: "text-eldora-coral",
    ghost: "text-eldora-text",
  }[variant];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || isLoading}
      className={`${baseClass} ${variantClass} ${className ?? ""}`}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: Boolean(disabled || isLoading), busy: Boolean(isLoading) }}
    >
      {isLoading ? (
        <ActivityIndicator
          color={variant === "primary" ? "white" : "#D95545"}
        />
      ) : (
        <View className="flex-row items-center justify-center gap-2">
          {icon}
          <Text className={`text-[15px] font-bold ${textClass}`}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};
