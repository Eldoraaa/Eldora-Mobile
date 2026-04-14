import React from "react";
import { View, ViewProps } from "react-native";

interface CardProps extends ViewProps {
  children: React.ReactNode;
  className?: string;
}

export const Card = ({ children, className, style, ...props }: CardProps) => (
  <View
    className={`bg-white rounded-3xl p-5 ${className ?? ""}`}
    style={[{ shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 }, style]}
    {...props}
  >
    {children}
  </View>
);
