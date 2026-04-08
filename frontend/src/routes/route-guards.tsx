import { Navigate, Outlet } from "react-router-dom"
import { useAuthStore } from "@/stores/auth-store"

export function ProtectedRoute() {
  const user = useAuthStore((state) => state.user)
  return user ? <Outlet /> : <Navigate to="/login" replace />
}

export function PublicRoute() {
  const user = useAuthStore((state) => state.user)
  return user ? <Navigate to="/" replace /> : <Outlet />
}
