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
import { useAuthStore } from "@/stores/auth-store";
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog";

const columnHelper = createColumnHelper<Reservation>();

function ActionsCell({ reservation }: { reservation: Reservation }) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const deleteReservation = useReservationDelete();
  const user = useAuthStore((state) => state.user);
  const isAdmin = useAuthStore((state) => state.isAdmin());

  // Check if current user can delete this reservation
  // Admin can delete any reservation, users can only delete their own
  const canDelete =
    isAdmin || (user && user.id === reservation.created_by);

  const handleDeleteConfirm = () => {
    deleteReservation.mutate(reservation.id, {
      onSuccess: () => {
        setShowDeleteDialog(false);
      },
    });
  };

  if (!canDelete) {
    return null;
  }

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className="text-destructive hover:bg-destructive/10 rounded-xl p-2 cursor-pointer inline-flex items-center transition-colors\"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash className="h-4 w-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={5}>
          Apagar reserva
        </TooltipContent>
      </Tooltip>

      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        itemType="reserva"
        onConfirm={handleDeleteConfirm}
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
  columnHelper.accessor("estado", {
    header: "Estado",
    cell: (info) => {
      const estado = info.getValue();
      return (
        <span
          className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
            estado === "ativa"
              ? "bg-green-500/20 text-green-700 dark:text-green-400 dark:bg-green-500/15"
              : estado === "expirada"
                ? "bg-red-500/20 text-red-700 dark:text-red-400 dark:bg-red-500/15"
                : estado === "reservada"
                  ? "bg-blue-500/20 text-blue-700 dark:text-blue-400 dark:bg-blue-500/15"
                  : "bg-gray-500/20 text-gray-700 dark:text-gray-400 dark:bg-gray-500/15"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full mr-1.5 ${
              estado === "ativa"
                ? "bg-green-600 dark:bg-green-400"
                : estado === "expirada"
                  ? "bg-red-600 dark:bg-red-400"
                  : estado === "reservada"
                    ? "bg-blue-600 dark:bg-blue-400"
                    : "bg-gray-600 dark:bg-gray-400"
            }`}
          />
          {estado || "-"}
        </span>
      );
    },
  }),
  columnHelper.display({
    id: "actions",
    header: "Ações",
    cell: ({ row }) => <ActionsCell reservation={row.original} />,
  }),
] as ColumnDef<Reservation>[];
