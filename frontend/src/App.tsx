import { RouterProvider } from "react-router-dom"
import { appRouter } from "@/routes/app-router"
import { useCurrentUser } from "@/hooks/use-auth"

function App() {
  const { isPending } = useCurrentUser()

  // Aguarda validação do JWT antes de renderizar rotas
  if (isPending) {
    return <div>Carregando...</div>
  }

  return <RouterProvider router={appRouter} />
}

export default App