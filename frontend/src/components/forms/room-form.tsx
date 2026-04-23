import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { roomFormSchema, type RoomFormData } from "@/lib/schemas/room-schema";
import type { Room } from "@/types/room";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

interface RoomFormProps {
  room?: Room | null;
  onSubmit: (data: RoomFormData) => void;
  isLoading?: boolean;
  onCancel: () => void;
}

export function RoomForm({
  room,
  onSubmit,
  isLoading = false,
  onCancel,
}: RoomFormProps) {
  const isEditing = !!room;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(roomFormSchema),
    defaultValues: room
      ? {
          name: room.name,
          location: room.location,
          capacity: room.capacity,
          capacity_exam: room.capacity_exam,
          characteristic_name: room.characteristic_name,
          building_identifier: room.building_identifier,
        }
      : undefined,
  });

  return (
    <Card className="w-full max-w-2xl mx-auto p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-1">
            {isEditing ? "Editar Sala" : "Criar Nova Sala"}
          </h2>
          <p className="text-sm text-gray-600">
            {isEditing
              ? "Atualize os detalhes da sala"
              : "Preencha os dados para criar uma nova sala"}
          </p>
        </div>

        {/* Nome */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Nome
          </label>
          <Input
            {...register("name")}
            id="name"
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Localização */}
        <div>
          <label
            htmlFor="location"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Localização
          </label>
          <Input
            {...register("location")}
            id="location"
            className={errors.location ? "border-red-500" : ""}
          />
          {errors.location && (
            <p className="text-red-500 text-sm mt-1">
              {errors.location.message}
            </p>
          )}
        </div>

        {/* Identificador de Prédio */}
        <div>
          <label
            htmlFor="building_identifier"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Identificador de Prédio
          </label>
          <Input
            {...register("building_identifier")}
            id="building_identifier"
            className={errors.building_identifier ? "border-red-500" : ""}
          />
          {errors.building_identifier && (
            <p className="text-red-500 text-sm mt-1">
              {errors.building_identifier.message}
            </p>
          )}
        </div>

        {/* Característica */}
        <div>
          <label
            htmlFor="characteristic_name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Característica
          </label>
          <Input
            {...register("characteristic_name")}
            id="characteristic_name"
            className={errors.characteristic_name ? "border-red-500" : ""}
          />
          {errors.characteristic_name && (
            <p className="text-red-500 text-sm mt-1">
              {errors.characteristic_name.message}
            </p>
          )}
        </div>

        {/* Capacidade */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="capacity"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Capacidade Normal (máx: 150)
            </label>
            <Input
              {...register("capacity")}
              id="capacity"
              type="number"
              className={errors.capacity ? "border-red-500" : ""}
            />
            {errors.capacity && (
              <p className="text-red-500 text-sm mt-1">
                {errors.capacity.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="capacity_exam"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Capacidade Exame (máx: 30)
            </label>
            <Input
              {...register("capacity_exam")}
              id="capacity_exam"
              type="number"
              className={errors.capacity_exam ? "border-red-500" : ""}
            />
            {errors.capacity_exam && (
              <p className="text-red-500 text-sm mt-1">
                {errors.capacity_exam.message}
              </p>
            )}
          </div>
        </div>

        {/* Botões */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading
              ? "Salvando..."
              : isEditing
                ? "Atualizar Sala"
                : "Criar Sala"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
