import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useReservationsStore } from "@/store/use-reservations-store";

const reservationSchema = z
  .object({
    room_id: z.coerce.number().positive(),
    user_id: z.coerce.number().positive(),
    start_time: z.iso.datetime(),
    end_time: z.iso.datetime(),
  })
  .refine((data) => new Date(data.end_time) > new Date(data.start_time), {
    path: ["end_time"],
    message: "O fim da reserva deve ser depois do inicio.",
  });

type ReservationFormInput = z.input<typeof reservationSchema>;
type ReservationFormOutput = z.output<typeof reservationSchema>;

export function NewReservationPage() {
  const navigate = useNavigate();
  const createReservation = useReservationsStore((state) => state.createReservation);

  const form = useForm<ReservationFormInput, unknown, ReservationFormOutput>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      room_id: 1,
      user_id: 1,
      start_time: "",
      end_time: "",
    },
  });

  async function onSubmit(values: ReservationFormOutput) {
    await createReservation(values);
    navigate("/");
  }

  return (
    <Card className="max-w-2xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Criar nova reserva</h2>
        <Link to="/" className="text-sm text-primary underline-offset-4 hover:underline">
          Voltar
        </Link>
      </div>

      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div>
          <label className="mb-1 block text-sm">ID da Sala</label>
          <Input type="number" {...form.register("room_id", { valueAsNumber: true })} />
        </div>

        <div>
          <label className="mb-1 block text-sm">ID do Usuario</label>
          <Input type="number" {...form.register("user_id", { valueAsNumber: true })} />
        </div>

        <div>
          <label className="mb-1 block text-sm">Inicio (ISO)</label>
          <Input placeholder="2026-04-06T10:00:00Z" {...form.register("start_time")} />
          <p className="mt-1 text-xs text-rose-400">{form.formState.errors.start_time?.message}</p>
        </div>

        <div>
          <label className="mb-1 block text-sm">Fim (ISO)</label>
          <Input placeholder="2026-04-06T11:00:00Z" {...form.register("end_time")} />
          <p className="mt-1 text-xs text-rose-400">{form.formState.errors.end_time?.message}</p>
        </div>

        <Button type="submit" className="w-full">
          Criar reserva
        </Button>
      </form>
    </Card>
  );
}
