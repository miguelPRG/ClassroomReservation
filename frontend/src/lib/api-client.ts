import type { AuthUser, LoginPayload, RegisterPayload } from "@/types/auth"

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000"

export class ApiError extends Error {
  status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.status = status
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  headers.set("Content-Type", "application/json")

  // JWT é enviado automaticamente via cookie HTTP-only
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: "include"
  })

  if (!response.ok) {
    const fallbackMessage = "Erro ao comunicar com o servidor."
    let message = fallbackMessage

    try {
      const body = await response.json()
      if (typeof body?.message === "string") {
        message = body.message
      }
    } catch {
      // Ignore parse errors and keep fallback message.
    }

    throw new ApiError(message, response.status)
  }

  return response.json() as Promise<T>
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
}
