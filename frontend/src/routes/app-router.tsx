import { createBrowserRouter } from "react-router-dom";
import { ProtectedRoute, PublicRoute } from "@/routes/route-guards";
import { createRoutes } from "@/routes/create-routes";

// Define the application routes with route guards for public and protected pages
export const appRouter = createBrowserRouter([
  ...createRoutes([
    {
      element: <PublicRoute />,
    },
    {
      element: <ProtectedRoute />,
    },
  ]),
]) as const;
