import { Navigate, Outlet } from "react-router-dom"
import { useAuthStore } from "@/stores/auth-store"
import { Header } from "@/components/Header"

export function ProtectedRoute() {
  const user = useAuthStore((state) => state.user)
  return user ? (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mt-25 bg-background">
        <Outlet />
      </main>
    </div>
  ) : (
    <Navigate to="/login" replace />
  )
}

export function PublicRoute() {
  const user = useAuthStore((state) => state.user)
  return user ? <Navigate to="/" replace /> : <Outlet />
}
