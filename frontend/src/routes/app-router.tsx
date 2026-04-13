import { lazy, Suspense } from "react"
import { createBrowserRouter } from "react-router-dom"
import { ProtectedRoute, PublicRoute } from "@/routes/route-guards"
import { Loading } from "@/components/loading"

const DashboardPage = lazy(() => import("@/pages/private/dashboard-page").then(m => ({ default: m.DashboardPage })))
const LoginPage = lazy(() => import("@/pages/login-page").then(m => ({ default: m.LoginPage })))
const RegisterPage = lazy(() => import("@/pages/register-page").then(m => ({ default: m.RegisterPage })))

// Define the application routes with route guards for public and protected pages
export const appRouter = createBrowserRouter([
  {
    element: <PublicRoute />,
    children: [
      { path: "/login", element: <Suspense fallback={<Loading />}><LoginPage /></Suspense> },
      { path: "/register", element: <Suspense fallback={<Loading />}><RegisterPage /></Suspense> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [{ path: "/", element: <Suspense fallback={<Loading />}><DashboardPage /></Suspense> }],
  },
])
