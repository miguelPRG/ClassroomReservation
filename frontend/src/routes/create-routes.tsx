import { lazy, Suspense } from "react";
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

interface RouteConfig {
  element: React.ReactNode;
}

export function createRoutes(guards: RouteConfig[]) {
  return [
    {
      element: guards[0].element,
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
      element: guards[1].element,
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
      ],
    },
  ];
}
