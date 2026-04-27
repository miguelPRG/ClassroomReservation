import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { ApiError, reservaApi } from "@/lib/api-client";
import type { ReservationPayload } from "@/types/reservation";

export function useReservationCreate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ReservationPayload) => reservaApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      toast.success("Reserva criada com sucesso.");
    },
    onError: (error) => {
      const message =
        error instanceof ApiError
          ? error.message
          : "Não foi possível criar a reserva.";
      toast.error(message);
    },
  });
}

export function useReservationQueryByRoom(
  {
    roomId,
  }: {
    roomId: string;
  } = {} as any,
) {
  return useQuery({
    queryKey: ["reservations", roomId],
    queryFn: () => reservaApi.getByRoom(roomId),
    placeholderData: keepPreviousData,
  });
}

export function useReservationQueryByRoomPaginated(
  {
    roomId,
    page = 0,
    pageSize = 5,
  }: {
    roomId: string;
    page?: number;
    pageSize?: number;
  } = {} as any,
) {
  return useQuery({
    queryKey: ["reservations", roomId, page, pageSize],
    queryFn: () => reservaApi.getByRoom(roomId, page, pageSize),
    placeholderData: keepPreviousData,
  });
}


export function useReservationDelete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reservationId: string) => reservaApi.delete(reservationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      toast.success("Reserva apagada com sucesso.");
    },
    onError: (error) => {
      const message =
        error instanceof ApiError
          ? error.message
          : "Não foi possível apagar a reserva.";
      toast.error(message);
    },
  });
}
