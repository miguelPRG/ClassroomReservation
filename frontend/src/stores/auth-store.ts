import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { AuthUser } from "@/types/auth";

type AuthState = {
  user: AuthUser | null;
  role: "user" | "admin" | null;
  setUser: (user: AuthUser | null) => void;
  setRole: (role: "user" | "admin" | null) => void;
  isAdmin: () => boolean;
};

export const useAuthStore = create<AuthState>()(
  devtools(
    (set, get) => ({
      user: null,
      role: null,
      setUser: (user) => set({ user }),
      setRole: (role) => set({ role }),
      isAdmin: () => get().role === "admin",
    }),
    {
      name: "AuthStore",
    },
  ),
);
