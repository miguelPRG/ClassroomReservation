import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { RoomForm } from "@/components/forms/room-form";
import { useRoomCreate, useRoomUpdate, useRoomQuery } from "@/hooks/use-rooms";
import type { RoomFormData } from "@/lib/schemas/room-schema";
import { Skeleton } from "@/components/ui/skeleton";
import type { Room } from "@/types/room";

export function RoomEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Query para carregar dados da sala específica (desabilitada em modo criação)
  const { data: queryData, isLoading: isQueryLoading } = useRoomQuery({
    ativar: !!id,
    roomID: id,
  });

  console.log("ID da sala:", id);

  let room: Room | null = null;

  if (id) {
    room =
      Array.isArray(queryData) && queryData.length > 0 ? queryData[0] : null;
  }

  console.log("Room data:", room);

  // Verifica se está no modo edição
  const isEditing = !!id;

  // Mutations
  const createMutation = useRoomCreate();
  const updateMutation = useRoomUpdate();

  const isLoading =
    createMutation.isPending || updateMutation.isPending || isQueryLoading;

  function handleSubmit(data: RoomFormData) {
    console.log("Form data:", data);

    if (isEditing && id) {
      // Atualizar sala
      updateMutation.mutate({
        roomID: id,
        payload: data,
      });
    } else {
      // Criar nova sala
      createMutation.mutate(data);
    }
  }

  // Redirecionar após sucesso
  useEffect(() => {
    if (createMutation.isSuccess || updateMutation.isSuccess) {
      navigate("/");
    }
  }, [createMutation.isSuccess, updateMutation.isSuccess, navigate]);

  return (
    <div className="py-8">
      {isQueryLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <RoomForm
          room={room}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          onCancel={() => navigate(-1)}
        />
      )}
    </div>
  );
}
