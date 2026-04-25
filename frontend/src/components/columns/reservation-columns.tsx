import { createColumnHelper } from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Trash } from "lucide-react";
import { useState } from "react";
import type { Reservation } from "@/types/reservation";
import { useReservationDelete } from "@/hooks/use-reservations";
import { AlertDialog } from "@/components/ui/alert-dialog";

const columnHelper = createColumnHelper<Reservation>();

function ActionsCell({ reservation }: { reservation: Reservation }) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const deleteReservation = useReservationDelete();

  const handleDeleteConfirm = () => {
    deleteReservation.mutate(reservation.id, {
      onSuccess: () => {
        setShowDeleteDialog(false);
      },
    });
  };

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className="bg-red-600 hover:bg-red-700 rounded-xl p-2 cursor-pointer inline-flex items-center transition-colors"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash className="h-4 w-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={5}>
          Apagar reserva
        </TooltipContent>
      </Tooltip>

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
      <div>{new Date(info.getValue()).toLocaleString("pt-PT")}</div>
    ),
  }),
  columnHelper.accessor("end_datetime", {
    header: "Data/Hora de Fim",
    cell: (info) => (
      <div>{new Date(info.getValue()).toLocaleString("pt-PT")}</div>
    ),
  }),
  columnHelper.accessor("created_by", {
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
