import { createColumnHelper } from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import type { Reservation } from "@/types/reservation";
import { useReservationDelete } from "@/hooks/use-reservations";
import { AlertDialog } from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const columnHelper = createColumnHelper<Reservation>();

function ActionsCell({ reservation }: { reservation: Reservation }) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const deleteReservation = useReservationDelete();

  const handleEdit = () => {
    console.log("Editar reserva:", reservation.id);
  };

  const handleDeleteConfirm = () => {
    deleteReservation.mutate(reservation.id, {
      onSuccess: () => {
        setShowDeleteDialog(false);
      },
    });
  };

  return (
    <>
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Abrir menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleEdit}>
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setShowDeleteDialog(true)}
              className="text-red-600"
            >
              Apagar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <AlertDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Apagar Reserva"
        description="Tem a certeza que quer apagar esta reserva? Esta ação não pode ser desfeita."
        cancelLabel="Cancelar"
        actionLabel="Apagar"
        onAction={handleDeleteConfirm}
        isDestructive
        isLoading={deleteReservation.isPending}
      />
    </>
  );
}

export const reservationColumns = [
  columnHelper.accessor("start_datetime", {
    header: "Data/Hora de Início",
    cell: (info) => (
      <div>
        {new Date(info.getValue()).toLocaleString("pt-PT")}
      </div>
    ),
  }),
  columnHelper.accessor("end_datetime", {
    header: "Data/Hora de Fim",
    cell: (info) => (
      <div>
        {new Date(info.getValue()).toLocaleString("pt-PT")}
      </div>
    ),
  }),
  columnHelper.accessor("created_at", {
    header: "Criada em",
    cell: (info) => (
      <div className="text-sm text-gray-500">
        {new Date(info.getValue()).toLocaleString("pt-PT")}
      </div>
    ),
  }),
  columnHelper.accessor("creator_name", {
    header: "Criada por (Nome)",
    cell: (info) => <div>{info.getValue() || "-"}</div>,
  }),
  columnHelper.accessor("creator_email", {
    header: "Email",
    cell: (info) => <div className="text-sm">{info.getValue() || "-"}</div>,
  }),
  columnHelper.display({
    id: "actions",
    header: "Ações",
    cell: ({ row }) => <ActionsCell reservation={row.original} />,
  }),
] as ColumnDef<Reservation>[];