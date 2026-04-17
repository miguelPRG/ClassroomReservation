import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DataTable from "@/components/DataTable";
import { roomColumns } from "@/components/columns/room-columns";
import { useRoomQuery } from "@/hooks/use-rooms";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardPage() {
  const navigate = useNavigate();
  const { data, isLoading, error } = useRoomQuery();

  return (
    <>
      <Card className="h-150 w-300 mx-auto">
        <CardHeader>
          <CardTitle>Salas Disponíveis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end">
            <Button
              onClick={() => navigate(`/room-edit`)}
              className="mb-4"
            >
              Adicionar Sala
            </Button>
          </div>
          {isLoading ? (
            <div className="flex flex-col justify-between">
              <Skeleton className=" h-100 w-full" />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500 text-sm">
                {error.message || "Erro ao carregar salas"}
              </p>
            </div>
          ) : data && data.length > 0 ? (
            <DataTable data={data} columns={roomColumns} />
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhuma sala disponível</p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
