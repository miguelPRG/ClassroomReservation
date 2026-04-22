import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { ReservationForm } from "@/components/forms/reservation-form";
import { useReservationCreate } from "@/hooks/use-reservations";
import type { ReservationFormData } from "@/lib/schemas/reservation-schema";

export function ReservationCreatePage() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();

  const createMutation = useReservationCreate();

  if (!roomId) {
    return (
      <div className="p-4">
        <p className="text-red-600">Erro: ID da sala não foi fornecido.</p>
      </div>
    );
  }

  function handleSubmit(data: ReservationFormData) {
    createMutation.mutate({
      room_id: roomId ? roomId : "", // Garantir que room_id é uma string, mesmo que roomId seja undefined
      start_datetime: new Date(data.start_datetime).toISOString(),
      end_datetime: new Date(data.end_datetime).toISOString(),
    });
  }

  // Redirecionar após sucesso
  useEffect(() => {
    if (createMutation.isSuccess) {
      navigate(`/reservas/${roomId}`);
    }
  }, [createMutation.isSuccess, roomId, navigate]);

  return (
    <div className="py-8">
      <ReservationForm
        roomId={roomId}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending}
        onCancel={() => navigate(`/reservas/${roomId}`)}
      />
    </div>
  );
}
