import { AlertDialog } from "@/components/ui/alert-dialog";

interface DeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemType: "sala" | "reserva";
  onConfirm: () => void;
  isLoading?: boolean;
}

export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  itemType,
  onConfirm,
  isLoading = false,
}: DeleteConfirmationDialogProps) {
  const itemLabel = itemType === "sala" ? "Sala" : "Reserva";
  const itemLabelLower = itemType === "sala" ? "sala" : "reserva";

  return (
    <AlertDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Apagar ${itemLabel}`}
      description={`Tem a certeza que quer apagar esta ${itemLabelLower}? Esta ação não pode ser desfeita.`}
      cancelLabel="Cancelar"
      actionLabel="Apagar"
      onAction={onConfirm}
      isDestructive
      isLoading={isLoading}
    />
  );
}
