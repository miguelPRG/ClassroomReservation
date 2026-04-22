import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { reservationFormSchema, type ReservationFormData } from "@/lib/schemas/reservation-schema";
import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import { Card } from "@/components/ui/card";

interface ReservationFormProps {
  roomId: string;
  onSubmit: (data: ReservationFormData) => void;
  isLoading?: boolean;
  onCancel: () => void;
}

export function ReservationForm({
  onSubmit,
  isLoading = false,
  onCancel,
}: ReservationFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(reservationFormSchema),
  });

  const handleFormSubmit = (data: ReservationFormData) => {
    onSubmit(data);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto p-6">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-1">Criar Nova Reserva</h2>
          <p className="text-sm text-gray-600">
            Preencha os dados para criar uma nova reserva
          </p>
        </div>

        {/* Data/Hora de Início */}
        <DateTimePicker
          {...register("start_datetime")}
          label="Data/Hora de Início"
          error={errors.start_datetime?.message}
        />

        {/* Data/Hora de Fim */}
        <DateTimePicker
          {...register("end_datetime")}
          label="Data/Hora de Fim"
          error={errors.end_datetime?.message}
        />

        {/* Botões */}
        <div className="flex gap-4 justify-end pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? "A criar..." : "Criar Reserva"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
