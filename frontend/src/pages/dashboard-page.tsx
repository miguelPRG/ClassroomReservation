import { useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuthStore } from "@/stores/auth-store"
import {useLogout} from "@/hooks/use-auth"

export function DashboardPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const logout = useLogout()  // Chame aqui, no corpo do componente

  const handleLogout = () => {
    logout()  // Chame a função retornada
    queryClient.removeQueries({ queryKey: ["me"] })
    navigate("/login")
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl items-start px-4 py-8 md:py-12">
      <Card className="w-full">
        <CardHeader className="flex flex-col items-start justify-between gap-4 border-b border-border/60 md:flex-row md:items-center">
          <div>
            <CardTitle className="text-2xl">Dashboard</CardTitle>
            <CardDescription className="mt-1">Área autenticada da aplicação.</CardDescription>
          </div>
          <Button variant="outline" className="w-full md:w-auto" onClick={handleLogout}>
            Terminar sessão
          </Button>
        </CardHeader>
        <CardContent className="space-y-6 pt-2">
          <p className="text-sm text-muted-foreground/90">
            Sessão ativa.
          </p>
          {user ? (
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-border/70 bg-muted/25 p-4">
                <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Nome</p>
                <p className="text-base font-medium">{user.nome}</p>
              </div>
              <div className="rounded-xl border border-border/70 bg-muted/25 p-4">
                <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Email</p>
                <p className="text-base font-medium">{user.email}</p>
              </div>
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-border/70 bg-muted/20 p-4 text-muted-foreground">
              Sem dados de utilizador disponíveis.
            </p>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
