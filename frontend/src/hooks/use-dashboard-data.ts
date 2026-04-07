import { useEffect } from "react";
import { useReservationsStore } from "@/store/use-reservations-store";

export function useDashboardData() {
  const { fetchBootstrap, rooms, reservations, loading } = useReservationsStore();

  useEffect(() => {
    void fetchBootstrap();
  }, [fetchBootstrap]);

  return { rooms, reservations, loading };
}
