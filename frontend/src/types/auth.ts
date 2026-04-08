export type AuthUser = {
  id: string
  nome: string
  email: string
}

export type LoginPayload = {
  email: string
  password: string
}

export type RegisterPayload = {
  nome: string
  email: string
  password: string
}