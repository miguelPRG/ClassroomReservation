import { toast } from "react-toastify";
import { create } from "zustand";
import { api } from "@/lib/api";
import type { NewReservationInput, Reservation, Room } from "@/types/domain";

type ReservationState = {
  rooms: Room[];
  reservations: Reservation[];
  loading: boolean;
  fetchBootstrap: () => Promise<void>;
  createReservation: (payload: NewReservationInput) => Promise<void>;
};

export const useReservationsStore = create<ReservationState>((set, get) => ({
  rooms: [],
  reservations: [],
  loading: false,

  fetchBootstrap: async () => {
    if (get().loading) return;

    try {
      set({ loading: true });
      const [rooms, reservations] = await Promise.all([
        api.getRooms(),
        api.getReservations(),
      ]);
      set({ rooms, reservations, loading: false });
    } catch {
      set({ loading: false });
      toast.error("Nao foi possivel carregar dados do backend.");
    }
  },

  createReservation: async (payload) => {
    try {
      const reservation = await api.createReservation(payload);
      set((state) => ({
        reservations: [reservation, ...state.reservations],
      }));
      toast.success("Reserva criada com sucesso.");
    } catch {
      toast.error("Falha ao criar reserva.");
    }
  },
}));
