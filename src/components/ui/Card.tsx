import React from "react";
import { View, ViewProps } from "react-native";

interface CardProps extends ViewProps {
  children: React.ReactNode;
  className?: string;
}

export const Card = ({ children, className, style, ...props }: CardProps) => (
  <View
    className={`rounded-[22px] border border-eldora-line bg-white p-5 ${className ?? ""}`}
    style={[
      {
        shadowColor: "#17202A",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.05,
        shadowRadius: 18,
        elevation: 2,
      },
      style,
    ]}
    {...props}
  >
    {children}
  </View>
);
