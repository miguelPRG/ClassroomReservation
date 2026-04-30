import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { ApiError, authApi } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";
import type { LoginPayload, RegisterPayload, AuthUser } from "@/types/auth";

export function useCurrentUser() {
  const setUser = useAuthStore((state) => state.setUser);
  const setRole = useAuthStore((state) => state.setRole);

  const query = useQuery({
    queryKey: ["me"],
    queryFn: authApi.me,
    staleTime: 0,
  });

  useEffect(() => {
    if (query.data) {
      setUser(query.data);
      setRole(query.data.role);
    }
  }, [query.data, query.isError, setUser, setRole]);

  return query;
}

export function useLogin() {
  const setUser = useAuthStore((state) => state.setUser);
  const setRole = useAuthStore((state) => state.setRole);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: (response: AuthUser) => {
      setUser(response);
      setRole(response.role);
      toast.success("Login efetuado com sucesso.");

      // Invalidar todas as querys para garantir que dados protegidos sejam recarregados com o novo estado de autenticação
      queryClient.invalidateQueries();
    
    },
    onError: (error) => {
      const message =
        error instanceof ApiError
          ? error.message
          : "Não foi possível iniciar sessão.";
      toast.error(message);
    },
  });
}

export function useRegister() {
  const setUser = useAuthStore((state) => state.setUser);
  const setRole = useAuthStore((state) => state.setRole);

  return useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
    onSuccess: (userData: AuthUser) => {
      setUser(userData);
      setRole(userData.role);
      toast.success("Conta criada com sucesso.");
    },
    onError: (error) => {
      const message =
        error instanceof ApiError
          ? error.message
          : "Não foi possível criar conta.";
      toast.error(message);
    },
  });
}

export function useLogout() {
  const setUser = useAuthStore((state) => state.setUser);
  const setRole = useAuthStore((state) => state.setRole);

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      setUser(null);
      setRole(null);
      toast.success("Logout efetuado com sucesso.");
    },
    onError: (error) => {
      const message =
        error instanceof ApiError
          ? error.message
          : "Não foi possível finalizar sessão.";
      toast.error(message);
    },
  });
}
