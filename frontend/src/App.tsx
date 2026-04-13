import { RouterProvider } from "react-router-dom"
import { appRouter } from "@/routes/app-router"
import { useCurrentUser } from "@/hooks/use-auth"
import { Loading } from "@/components/loading"

function App() {
  const { isPending } = useCurrentUser()

  // Aguarda validação do JWT antes de renderizar rotas
  if (isPending) {
    return <Loading />
  }

  return <RouterProvider router={appRouter} />
}

export default App