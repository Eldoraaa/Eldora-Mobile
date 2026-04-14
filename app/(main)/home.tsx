import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/stores/authStore";
import { useAlertStore } from "@/stores/alertStore";
import { homeService } from "@/services/homeService";
import { GreetingHeader } from "@/components/home/GreetingHeader";
import { DeviceStatusCard } from "@/components/home/DeviceStatusCard";
import { AlertCard } from "@/components/home/AlertCard";
import { Card } from "@/components/ui/Card";
import { HomeSummary } from "@/types/home.types";

export default function HomeScreen() {
  const { user, logout } = useAuthStore();
  const { alerts, setAlerts, setLoading } = useAlertStore();

  const handleLogout = () => {
    Alert.alert("Keluar", "Yakin ingin keluar dari akun ini?", [
      { text: "Batal", style: "cancel" },
      { text: "Keluar", style: "destructive", onPress: logout },
    ]);
  };
  const [summary, setSummary] = useState<HomeSummary | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await homeService.getSummary();
      setSummary(data);
      setAlerts(data.recentAlerts);
    } catch (err) {
      console.error("[Home] Gagal memuat data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-eldora-base">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-8"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FF8A7A"
          />
        }
      >
        {/* Top bar */}
        <View className="flex-row items-start justify-between pt-6 pb-2">
          <GreetingHeader userName={user?.name ?? "Pengguna"} />
          <TouchableOpacity
            onPress={handleLogout}
            className="mt-1 px-3 py-1.5 rounded-2xl bg-white"
            style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 }}
          >
            <Text className="text-sm text-eldora-text-muted font-medium">Keluar</Text>
          </TouchableOpacity>
        </View>

        {/* Device status */}
        {summary && summary.devices.length > 0 && (
          <View className="mt-5">
            <Text className="text-base font-semibold text-eldora-text mb-3">
              Status Perangkat
            </Text>
            {summary.devices.map((device) => (
              <DeviceStatusCard key={device.deviceId} device={device} />
            ))}
          </View>
        )}

        {/* Recent alerts */}
        <View className="mt-5">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-base font-semibold text-eldora-text">
              Alert Terbaru
            </Text>
            {summary && summary.unreadAlertCount > 0 && (
              <View className="bg-eldora-coral px-2.5 py-0.5 rounded-full">
                <Text className="text-xs font-bold text-white">
                  {summary.unreadAlertCount}
                </Text>
              </View>
            )}
          </View>

          {alerts.length === 0 ? (
            <Card className="items-center py-10">
              <Text className="text-4xl mb-3">✅</Text>
              <Text className="text-base font-semibold text-eldora-text mb-1">
                Semua Aman
              </Text>
              <Text className="text-sm text-eldora-text-muted text-center">
                Tidak ada alert aktif saat ini
              </Text>
            </Card>
          ) : (
            alerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
