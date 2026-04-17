import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { RoomForm } from "@/components/forms/room-form";
import { useRoomCreate, useRoomUpdate } from "@/hooks/use-rooms";
import type { RoomFormData } from "@/lib/schemas/room-schema";
import type { Room } from "@/types/room";

export function RoomEditPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // Validar que o ID é real (não "null" ou vazio)
  const isEditing = !!id && id !== "null" && id.length > 0;

  const room = (location.state as { room?: Room } | null)?.room;

  // Mutations
  const createMutation = useRoomCreate();
  const updateMutation = useRoomUpdate();

  const isLoading = createMutation.isPending || updateMutation.isPending;

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
      <RoomForm room={room} onSubmit={handleSubmit} isLoading={isLoading} onCancel={() => navigate(-1)} />
    </div>
  );
}
