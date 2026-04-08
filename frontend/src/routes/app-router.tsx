import { lazy, Suspense } from "react"
import { createBrowserRouter } from "react-router-dom"
import { ProtectedRoute, PublicRoute } from "@/routes/route-guards"

const DashboardPage = lazy(() => import("@/pages/dashboard-page").then(m => ({ default: m.DashboardPage })))
const LoginPage = lazy(() => import("@/pages/login-page").then(m => ({ default: m.LoginPage })))
const RegisterPage = lazy(() => import("@/pages/register-page").then(m => ({ default: m.RegisterPage })))

// Define the application routes with route guards for public and protected pages
export const appRouter = createBrowserRouter([
  {
    element: <PublicRoute />,
    children: [
      { path: "/login", element: <Suspense fallback={<div>Carregando...</div>}><LoginPage /></Suspense> },
      { path: "/register", element: <Suspense fallback={<div>Carregando...</div>}><RegisterPage /></Suspense> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [{ path: "/", element: <Suspense fallback={<div>Carregando...</div>}><DashboardPage /></Suspense> }],
  },
])
