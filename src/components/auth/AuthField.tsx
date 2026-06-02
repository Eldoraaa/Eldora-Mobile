import React from "react";
import { Text, View } from "react-native";

type AuthFieldProps = {
  label: string;
  error?: string;
  children: React.ReactNode;
};

export function AuthField({ label, error, children }: AuthFieldProps) {
  return (
    <View>
      <Text className="mb-2 text-[13px] font-bold text-eldora-text">
        {label}
      </Text>
      <View
        className={`h-14 flex-row items-center rounded-2xl border bg-white px-4 ${
          error ? "border-alert-critical" : "border-eldora-line"
        }`}
      >
        {children}
      </View>
      {error ? (
        <Text className="mt-1.5 text-[12px] font-semibold text-alert-critical">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
