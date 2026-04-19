import { createColumnHelper } from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Room } from "@/types/room";
import { useRoomDelete } from "@/hooks/use-rooms";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


const columnHelper = createColumnHelper<Room>();

function ActionsCell({ room }: { room: Room }) {
  const navigate = useNavigate();
  const deleteRoom = useRoomDelete();

  const handleEdit = () => {
    navigate(`/room-edit/${room.id}`);
  };

  const handleDelete = () => {
    deleteRoom.mutate(room.id);
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
          <DropdownMenuItem onClick={handleEdit}>
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={handleDelete}
            className="text-red-600"
          >
            Apagar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
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
    cell: (info) => (
      <div className="flex justify-center">
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            info.getValue()
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {info.getValue() ? "Livre" : "Ocupada"}
        </span>
      </div>
    ),
  }),
  columnHelper.display({
    id: "actions",
    header: "Ações",
    cell: ({ row }) => <ActionsCell room={row.original} />,
  }),
] as ColumnDef<Room>[];
