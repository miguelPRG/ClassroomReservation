import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Link } from "react-router-dom"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useLogin } from "@/hooks/use-auth"

const schema = z.object({
  email: z.email("Email inválido."),
  password: z.string().min(6, "Password deve ter pelo menos 6 caracteres."),
})

type LoginFormValues = z.infer<typeof schema>

export function LoginPage() {
  const loginMutation = useLogin()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (values: LoginFormValues) => {
    await loginMutation.mutateAsync(values)
  }

  return (
    <main className="mx-auto grid min-h-screen w-full max-w-6xl items-center gap-8 px-4 py-8 md:grid-cols-2">
      <section className="hidden space-y-4 md:block">
        <p className="inline-flex rounded-full border border-border/70 bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
          WebServices Platform
        </p>
        <h1 className="text-4xl font-semibold leading-tight">
          Gestão simples do teu sistema, num único painel.
        </h1>
        <p className="max-w-md text-base text-muted-foreground">
          Frontend SPA moderno com autenticação, cache inteligente e experiência focada em rapidez.
        </p>
      </section>

      <Card className="w-full max-w-md justify-self-center">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Entrar</CardTitle>
          <CardDescription>Inicie sessão para aceder à aplicação.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/90" htmlFor="email">
                Email
              </label>
              <Input id="email" type="email" placeholder="email@dominio.com" {...register("email")} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/90" htmlFor="password">
                Password
              </label>
              <Input id="password" type="password" placeholder="********" {...register("password")} />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>

            <Button className="w-full text-sm font-semibold" type="submit" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? "A entrar..." : "Entrar"}
            </Button>
          </form>

          <p className="text-sm text-muted-foreground">
            Ainda não tem conta?{" "}
            <Link className="font-medium text-primary hover:underline" to="/register">
              Criar conta
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
