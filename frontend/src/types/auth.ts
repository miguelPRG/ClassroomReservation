export type AuthUser = {
  id: string;
  nome: string;
  email: string;
  role: "user" | "admin";
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  nome: string;
  email: string;
  password: string;
};
