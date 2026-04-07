import type { NewReservationInput, Reservation, Room } from "@/types/domain";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  getRooms: () => request<Room[]>("/rooms"),
  getReservations: () => request<Reservation[]>("/reservations"),
  createReservation: (payload: NewReservationInput) =>
    request<Reservation>("/reservations", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
