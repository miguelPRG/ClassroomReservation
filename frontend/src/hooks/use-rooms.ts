import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { ApiError, roomApi } from "@/lib/api-client";
import type { RoomPayload } from "@/types/room";

export function useRoomCreate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RoomPayload) => roomApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      toast.success("Sala criada com sucesso.");
    },
    onError: (error) => {
      const message =
        error instanceof ApiError
          ? error.message
          : "Não foi possível criar a sala.";
      toast.error(message);
    },
  });
}

export function useRoomQuery(roomID: string | null = null) {
  return useQuery({
    queryKey: ["rooms", roomID],
    queryFn: () => roomApi.get(roomID),
  });
}

export function useRoomUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      roomID,
      payload,
    }: {
      roomID: string;
      payload: RoomPayload;
    }) => roomApi.put(roomID, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      toast.success("Sala atualizada com sucesso.");
    },
    onError: (error) => {
      const message =
        error instanceof ApiError
          ? error.message
          : "Não foi possível atualizar a sala.";
      toast.error(message);
    },
  });
}

export function useRoomDelete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roomID: string) => roomApi.delete(roomID),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      toast.success("Sala deletada com sucesso.");
    },
    onError: (error) => {
      const message =
        error instanceof ApiError
          ? error.message
          : "Não foi possível deletar a sala.";
      toast.error(message);
    },
  });
}
