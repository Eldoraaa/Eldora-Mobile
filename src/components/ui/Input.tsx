import React from "react";
import { View, TextInput, Text, TextInputProps } from "react-native";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  className?: string;
}

export const Input = ({ label, error, className, ...props }: InputProps) => (
  <View className="gap-1.5">
    {label && (
      <Text className="text-sm font-medium text-eldora-text">{label}</Text>
    )}
    <TextInput
      className={`bg-white border rounded-2xl px-4 py-3.5 text-base text-eldora-text min-h-[52px] ${
        error ? "border-alert-critical" : "border-gray-200"
      } ${className ?? ""}`}
      placeholderTextColor="#B0B0B0"
      {...props}
    />
    {error && (
      <Text className="text-xs text-alert-critical">{error}</Text>
    )}
  </View>
);
