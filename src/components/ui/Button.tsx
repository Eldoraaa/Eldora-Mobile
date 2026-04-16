import React from "react";
import { TouchableOpacity, Text, ActivityIndicator } from "react-native";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost";
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

export const Button = ({
  title,
  onPress,
  variant = "primary",
  isLoading,
  disabled,
  className,
}: ButtonProps) => {
  const baseClass =
    "rounded-lg py-4 px-8 items-center justify-center min-h-[56px]";

  const variantClass = {
    primary: "bg-eldora-coral active:opacity-80",
    secondary: "bg-eldora-blue-light border border-eldora-blue active:opacity-80",
    ghost: "bg-transparent",
  }[variant];

  const textClass = {
    primary: "text-white",
    secondary: "text-eldora-blue",
    ghost: "text-eldora-text",
  }[variant];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || isLoading}
      className={`${baseClass} ${variantClass} ${className ?? ""}`}
      activeOpacity={0.85}
    >
      {isLoading ? (
        <ActivityIndicator
          color={variant === "primary" ? "white" : "#7BA7D4"}
        />
      ) : (
        <Text className={`text-base font-semibold ${textClass}`}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};
