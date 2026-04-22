import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import { ProtectedRoute, PublicRoute } from "@/routes/route-guards";
import { Loading } from "@/components/loading";

const DashboardPage = lazy(() =>
  import("@/pages/private/Dashboard").then((m) => ({
    default: m.DashboardPage,
  })),
);
const LoginPage = lazy(() =>
  import("@/pages/login-page").then((m) => ({ default: m.LoginPage })),
);
const RegisterPage = lazy(() =>
  import("@/pages/register-page").then((m) => ({ default: m.RegisterPage })),
);
const RoomEdit = lazy(() =>
  import("@/pages/private/RoomEdit").then((m) => ({ default: m.RoomEditPage })),
);
const ReservasRoom = lazy(() =>
  import("@/pages/private/ReservasRoom").then((m) => ({ default: m.default })),
);
const ReservationCreate = lazy(() =>
  import("@/pages/private/ReservationCreate").then((m) => ({
    default: m.ReservationCreatePage,
  })),
);

// Define the application routes with route guards for public and protected pages
export const appRouter = createBrowserRouter([
  {
    element: <PublicRoute />,
    children: [
      {
        path: "/login",
        element: (
          <Suspense fallback={<Loading />}>
            <LoginPage />
          </Suspense>
        ),
      },
      {
        path: "/register",
        element: (
          <Suspense fallback={<Loading />}>
            <RegisterPage />
          </Suspense>
        ),
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: (
          <Suspense fallback={<Loading />}>
            <DashboardPage />
          </Suspense>
        ),
      },
      {
        path: "/room-edit",
        element: (
          <Suspense fallback={<Loading />}>
            <RoomEdit />
          </Suspense>
        ),
      },
      {
        path: "/room-edit/:id",
        element: (
          <Suspense fallback={<Loading />}>
            <RoomEdit />
          </Suspense>
        ),
      },
      {
        path: "/reservas/:roomId",
        element: (
          <Suspense fallback={<Loading />}>
            <ReservasRoom />
          </Suspense>
        ),
      },
      {
        path: "/reservas/:roomId/criar",
        element: (
          <Suspense fallback={<Loading />}>
            <ReservationCreate />
          </Suspense>
        ),
      },
    ],
  },
]);
