import { z } from "zod";

export const reservationFormSchema = z
  .object({
    start_datetime: z
      .string()
      .min(1, "Data e hora de início é obrigatória")
      .refine((val) => {
        const date = new Date(val);
        const now = new Date();
        return date > now;
      }, "A data e hora de início deve ser no futuro")
      .refine((val) => {
        const date = new Date(val);
        const now = new Date();
        const maxDate = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);
        return date <= maxDate;
      }, "A data e hora de início não pode ser superior a 6 meses no futuro"),
    end_datetime: z
      .string()
      .min(1, "Data e hora de fim é obrigatória")
      .refine((val) => {
        const date = new Date(val);
        const now = new Date();
        return date > now;
      }, "A data e hora de fim deve ser no futuro")
      .refine((val) => {
        const date = new Date(val);
        const now = new Date();
        const maxDate = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);
        return date <= maxDate;
      }, "A data e hora de fim não pode ser superior a 6 meses no futuro"),
  })
  .refine(
    (data) => new Date(data.end_datetime) > new Date(data.start_datetime),
    {
      message:
        "A data e hora de fim deve ser posterior à data e hora de início",
      path: ["end_datetime"],
    },
  );

export type ReservationFormData = z.infer<typeof reservationFormSchema>;
