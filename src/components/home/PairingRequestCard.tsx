import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { Check, Clock, Users, X } from "lucide-react-native";
import { DevicePairingRequest } from "@/types/device.types";
import { COLORS } from "@/constants/theme";
import { formatExpiresIn } from "@/utils/home.utils";

type PairingRequestCardProps = {
  request: DevicePairingRequest;
  busy: boolean;
  onApprove: () => void;
  onReject: () => void;
};

export function PairingRequestCard({
  request,
  busy,
  onApprove,
  onReject,
}: PairingRequestCardProps) {
  return (
    <View className="mb-3 rounded-[24px] bg-white p-4">
      <View className="flex-row items-start gap-3">
        <View
          className="h-12 w-12 items-center justify-center rounded-3xl"
          style={{ backgroundColor: COLORS.coralSoft }}
        >
          <Users size={22} color={COLORS.coral} />
        </View>
        <View className="flex-1">
          <Text
            className="text-[15px] font-bold"
            style={{ color: COLORS.text }}
          >
            {request.requester.name}
          </Text>
          <Text className="mt-0.5 text-xs" style={{ color: COLORS.muted }}>
            Wants access to {request.device.name}
          </Text>
          <View className="mt-2 flex-row items-center gap-1.5">
            <Clock size={13} color={COLORS.muted} />
            <Text
              className="text-[11px] font-semibold"
              style={{ color: COLORS.muted }}
            >
              {formatExpiresIn(request.expiresAt)}
            </Text>
          </View>
        </View>
      </View>

      <View className="mt-4 flex-row gap-3">
        <TouchableOpacity
          onPress={onReject}
          disabled={busy}
          className="h-12 flex-1 flex-row items-center justify-center gap-2 rounded-2xl"
          style={{ backgroundColor: COLORS.surfaceMuted }}
          activeOpacity={0.82}
        >
          <X size={17} color={COLORS.coral} />
          <Text className="font-bold" style={{ color: COLORS.coral }}>
            Reject
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onApprove}
          disabled={busy}
          className="h-12 flex-1 flex-row items-center justify-center gap-2 rounded-2xl"
          style={{ backgroundColor: COLORS.coral }}
          activeOpacity={0.9}
        >
          {busy ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Check size={17} color="#FFFFFF" />
              <Text className="font-bold text-white">Approve</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
