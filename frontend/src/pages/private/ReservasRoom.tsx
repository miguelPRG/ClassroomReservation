import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DataTable from "@/components/DataTable";
import { Pagination } from "@/components/Pagination";
import { reservationColumns } from "@/components/columns/reservation-columns";
import { useReservationQueryByRoomPaginated } from "@/hooks/use-reservations";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PAGE_SIZE_OPTIONS = [5, 10, 15, 20];

export default function ReservasRoom() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const {
    data: reservations = [],
    isLoading,
    error,
  } = useReservationQueryByRoomPaginated({
    roomId: roomId || "",
    page,
    pageSize,
  });

  if (!roomId) {
    navigate("/salas");
    return null;
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
          <div className="flex items-center gap-2">
            <Select value={pageSize.toString()} onValueChange={(value) => {
              setPageSize(Number(value));
              setPage(0);
            }}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size} por página
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => navigate(`/reservas/${roomId}/criar`)}>
              Criar Reserva
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col justify-between">
            <Skeleton className="h-100 w-full" />
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-destructive text-sm">
              {error.message || "Erro ao carregar reservas"}
            </p>
          </div>
        ) : reservations && reservations.length > 0 ? (
          <>
            <DataTable columns={reservationColumns} data={reservations} />
            <Pagination
              page={page}
              pageSize={pageSize}
              onPreviousPage={() => setPage((prev) => Math.max(prev - 1, 0))}
              onNextPage={() => setPage((prev) => prev + 1)}
              isFirstPage={page === 0}
              isLastPage={reservations.length < pageSize}
            />
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Nenhuma reserva disponível</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
