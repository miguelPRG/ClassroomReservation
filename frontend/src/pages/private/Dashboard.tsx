import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DataTable from "@/components/DataTable";
import { Pagination } from "@/components/Pagination";
import { roomColumns } from "@/components/columns/room-columns";
import { useRoomQuery } from "@/hooks/use-rooms";
import { useAuthStore } from "@/stores/auth-store";
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

export function DashboardPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const isAdmin = useAuthStore((state) => state.isAdmin());

  const { data, isLoading, error } = useRoomQuery({ page, pageSize });

  return (
    <>
      <Card className="h-150 w-300 mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Salas Disponíveis</CardTitle>
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
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end">
            {isAdmin && (
              <Button onClick={() => navigate(`/room-edit`)} className="mb-4">
                Adicionar Sala
              </Button>
            )}
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
          {!isLoading && !error && (
            <Pagination
              page={page}
              pageSize={pageSize}
              onPreviousPage={() => setPage((prev) => Math.max(prev - 1, 0))}
              onNextPage={() => setPage((prev) => prev + 1)}
              isFirstPage={page === 0}
              isLastPage={data ? data.length < pageSize : true}
            />
          )}
        </CardContent>
      </Card>
    </>
  );
}
