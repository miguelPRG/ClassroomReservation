import { createColumnHelper } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import type { Room } from "@/types/room"

const columnHelper = createColumnHelper<Room>()

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
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          info.getValue()
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
        }`}>
          {info.getValue() ? "Livre" : "Ocupada"}
        </span>
      </div>
    ),
  }),
  columnHelper.display({
    id: "actions",
    header: "Ações",
    cell: () => (
      <div className="flex justify-center">
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Abrir menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
    ),
  }),
]
