import { useState } from "react";
import { Button } from "@/components/ui/button";

interface AlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  cancelLabel?: string;
  actionLabel?: string;
  onAction: () => void;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export function AlertDialog({
  open,
  onOpenChange,
  title,
  description,
  cancelLabel = "Cancelar",
  actionLabel = "Confirmar",
  onAction,
  isDestructive = false,
  isLoading = false,
}: AlertDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative bg-card border border-border rounded-lg shadow-lg p-6 max-w-sm w-full mx-4">
        <h2 className="text-lg font-semibold mb-2 text-card-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground mb-6">{description}</p>
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            onClick={onAction}
            disabled={isLoading}
            className={isDestructive ? "bg-red-600 hover:bg-red-700" : ""}
          >
            {isLoading ? "A processar..." : actionLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
