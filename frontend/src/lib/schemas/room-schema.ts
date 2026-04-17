import { z } from "zod";

export const roomFormSchema = z
  .object({
    name: z.string().min(1, "Nome é obrigatório").max(255, "Nome muito longo"),
    location: z
      .string()
      .min(1, "Localização é obrigatória")
      .max(255, "Localização muito longa"),
    capacity: z.coerce
      .number()
      .int("Capacidade deve ser um número inteiro")
      .min(1, "Capacidade deve ser maior que 0")
      .max(150, "Capacidade máxima é 150"),
    capacity_exam: z.coerce
      .number()
      .int("Capacidade de exame deve ser um número inteiro")
      .min(1, "Capacidade de exame deve ser maior que 0")
      .max(30, "Capacidade de exame máxima é 30"),
    characteristic_name: z
      .string()
      .min(1, "Característica é obrigatória")
      .max(150, "Característica muito longa"),
    building_identifier: z
      .string()
      .min(1, "Identificador de prédio é obrigatório")
      .max(50, "Identificador de prédio muito longo"),
  })
  .refine((data) => data.capacity_exam <= data.capacity, {
    message: "Capacidade de exame não pode ser maior que a capacidade normal",
    path: ["capacity_exam"],
  });

export type RoomFormData = z.infer<typeof roomFormSchema>;
