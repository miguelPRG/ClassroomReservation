import type { AuthUser, LoginPayload, RegisterPayload } from "@/types/auth";
import type { RoomPayload, Room } from "@/types/room";
import type { Reservation } from "@/types/reservation";

// Determina a URL da API dinamicamente
// Em produção, VITE_API_URL é definido no build e compilado como "/api"
// Em desenvolvimento, usa a variável ou localhost como fallback
const API_URL = (() => {
  // Primeiro, tenta usar a variável que foi compilada pelo Vite
  const viteApiUrl = import.meta.env.VITE_API_URL ;
  if (viteApiUrl) {
    return viteApiUrl;
  }
  // Se não estiver definida, em produção usa "/api", em dev usa localhost
  if (import.meta.env.PROD) {
    return "/api";
  }
  return "http://localhost:8000";
})();

export class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  // JWT é enviado automaticamente via cookie HTTP-only
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    const fallbackMessage = "Erro ao comunicar com o servidor.";
    let message = fallbackMessage;

    try {
      const body = await response.json();
      if (typeof body?.detail === "string") {
        message = body.detail;
      }
    } catch {
      // Se não conseguir fazer parse do JSON, usa fallback
    }

    throw new ApiError(message, response.status);
  }

  return response.json() as Promise<T>;
}

export const authApi = {
  login: (payload: LoginPayload) =>
    request<AuthUser>("/user/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  register: (payload: RegisterPayload) =>
    request<AuthUser>("/user/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  logout: () =>
    request("/user/logout", {
      method: "POST",
    }),
  me: () => request<AuthUser>("/user/me", {}),
};

export const roomApi = {
  create: (payload: RoomPayload) =>
    request("/room", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  list: (page?: number | null, pageSize?: number | null) =>
    request<Room[]>(
      `/room${page !== undefined && page !== null ? `?page=${page}` : ""}${pageSize !== undefined && pageSize !== null ? `&page_size=${pageSize}` : ""}`,
      {
        method: "GET",
      },
    ),
  getById: (roomID: string | null = null) =>
    

    request<Room>(`/room/${roomID}`, {
      method: "GET",
    }),
  put: (roomID: string, payload: RoomPayload) =>
    request(`/room/${roomID}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  delete: (roomID: string) =>
    request(`/room/${roomID}`, {
      method: "DELETE",
    }),
};

export const reservaApi = {
  create: (payload: any) =>
    request("/reservation", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getByRoom: (roomID: string, page?: number | null, pageSize?: number | null) =>
    request<Reservation[]>(
      `/reservation/room/${roomID}${page !== undefined && page !== null ? `?page=${page}` : ""}${pageSize !== undefined && pageSize !== null ? `&page_size=${pageSize}` : ""}`,
      {
        method: "GET",
      },
    ),
  delete: (reservationID: string) =>
    request(`/reservation/${reservationID}`, {
      method: "DELETE",
    }),
};
