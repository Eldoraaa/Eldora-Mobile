import { useEffect } from "react";
import { useHomesQuery } from "@/hooks/useHomeManagementQueries";
import { useHomeStore } from "@/stores/homeStore";

export function useSelectedHome() {
  const homesQuery = useHomesQuery();
  const homes = homesQuery.data ?? [];
  const selectedHomeId = useHomeStore((state) => state.selectedHomeId);
  const setSelectedHomeId = useHomeStore((state) => state.setSelectedHomeId);
  const selectedHome = homes.find((home) => home.id === selectedHomeId) ?? homes[0];

  useEffect(() => {
    if (!homes.length) return;
    if (!selectedHomeId || !homes.some((home) => home.id === selectedHomeId)) {
      setSelectedHomeId(homes[0].id);
    }
  }, [homes, selectedHomeId, setSelectedHomeId]);

  return {
    homesQuery,
    homes,
    selectedHome,
    selectedHomeId: selectedHome?.id ?? null,
    selectedHomeName: selectedHome?.name ?? "...",
    setSelectedHomeId,
  };
}
