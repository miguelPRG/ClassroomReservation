import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DataTable from "@/components/DataTable";
import { reservationColumns } from "@/components/columns/reservation-columns";
import { useReservationQueryByRoom } from "@/hooks/use-reservations";
import { Skeleton } from "@/components/ui/skeleton";

export default function ReservasRoom() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const {
    data: reservations = [],
    isLoading,
    error,
  } = useReservationQueryByRoom({
    roomId: roomId || "",
  });

  if (!roomId) {
    return (
      <div className="p-4">
        <p className="text-red-600">Erro: ID da sala não foi fornecido.</p>
      </div>
    );
  }

  return (
    <Card className="mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle>Reservas da Sala</CardTitle>
          </div>
          <Button onClick={() => navigate(`/reservas/${roomId}/criar`)}>
            Criar Reserva
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col justify-between">
            <Skeleton className="h-100 w-full" />
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500 text-sm">
              {error.message || "Erro ao carregar reservas"}
            </p>
          </div>
        ) : reservations && reservations.length > 0 ? (
          <DataTable columns={reservationColumns} data={reservations} />
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Nenhuma reserva disponível</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
