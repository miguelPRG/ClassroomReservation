import { createColumnHelper } from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth-store";
import type { Room } from "@/types/room";
import { useRoomDelete } from "@/hooks/use-rooms";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog";

const columnHelper = createColumnHelper<Room>();

function ActionsCell({ room }: { room: Room }) {
  const navigate = useNavigate();
  const deleteRoom = useRoomDelete();
  const isAdmin = useAuthStore((state) => state.isAdmin());
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleEdit = () => {
    navigate(`/room-edit/${room.id}`);
  };

  const handleViewReservations = () => {
    navigate(`/reservas/${room.id}`);
  };

  const handleDeleteConfirm = () => {
    deleteRoom.mutate(room.id, {
      onSuccess: () => {
        setShowDeleteDialog(false);
      },
    });
  };

  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Abrir menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {isAdmin && (
            <>
              <DropdownMenuItem onClick={handleEdit}>Editar</DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
              >
                Apagar
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuItem onClick={handleViewReservations}>
            Ver Reservas
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        itemType="sala"
        onConfirm={handleDeleteConfirm}
        isLoading={deleteRoom.isPending}
      />
    </div>
  );
}

export const roomColumns = [
  columnHelper.accessor("name", {
    header: "Nome",
    cell: (info) => <div className="font-medium">{info.getValue()}</div>,
  }),
  columnHelper.accessor("location", {
    header: "Localização",
  }),
  columnHelper.accessor("capacity", {
    header: "Capacidade",
    cell: (info) => <div className="text-center">{info.getValue()}</div>,
  }),
  columnHelper.accessor("capacity_exam", {
    header: "Capacidade (Exame)",
    cell: (info) => <div className="text-center">{info.getValue()}</div>,
  }),
  columnHelper.accessor("characteristic_name", {
    header: "Característica",
  }),
  columnHelper.accessor("building_identifier", {
    header: "Prédio",
  }),
  columnHelper.accessor("isFree", {
    header: "Status",
    cell: (info) => {
      const isFree = info.getValue();
      return (
        <div className="flex justify-center">
          <span
            className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              isFree
                ? "bg-green-500/20 text-green-700 dark:text-green-400 dark:bg-green-500/15"
                : "bg-red-500/20 text-red-700 dark:text-red-400 dark:bg-red-500/15"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full mr-1.5 ${
                isFree ? "bg-green-600 dark:bg-green-400" : "bg-red-600 dark:bg-red-400"
              }`}
            />
            {isFree ? "Livre" : "Ocupada"}
          </span>
        </div>
      );
    },
  }),
  columnHelper.display({
    id: "actions",
    header: "Ações",
    cell: ({ row }) => <ActionsCell room={row.original} />,
  }),
] as ColumnDef<Room>[];
