import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDashboardData } from "@/hooks/use-dashboard-data";

export function DashboardPage() {
  const { rooms, reservations, loading } = useDashboardData();

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-muted-foreground">
          Frontend para o backend de salas, usuarios e reservas.
        </p>
        <Link to="/reservations/new">
          <Button>Nova Reserva</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Salas ativas</p>
          <p className="mt-2 text-2xl font-semibold">{rooms.filter((room) => room.is_active).length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Reservas totais</p>
          <p className="mt-2 text-2xl font-semibold">{reservations.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Status</p>
          <p className="mt-2 text-sm font-semibold">{loading ? "Sincronizando com backend..." : "Dados carregados"}</p>
        </Card>
      </div>

      <Card className="p-4">
        <h2 className="mb-3 text-base font-semibold">Ultimas reservas</h2>
        {reservations.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma reserva encontrada.</p>
        ) : (
          <ul className="space-y-2">
            {reservations.slice(0, 8).map((reservation) => (
              <li key={reservation.id} className="rounded-md border border-border p-3 text-sm">
                <span className="font-medium">Reserva #{reservation.id}</span>
                <span className="mx-2 text-muted-foreground">Sala {reservation.room_id}</span>
                <span className="text-muted-foreground">{reservation.status}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
