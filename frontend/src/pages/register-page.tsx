import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRegister } from "@/hooks/use-auth";

const schema = z
  .object({
    name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres."),
    email: z.email("Email inválido."),
    password: z.string().min(6, "Password deve ter pelo menos 6 caracteres."),
    confirmPassword: z.string().min(6, "Confirme a password."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "As passwords não coincidem.",
  });

type RegisterFormValues = z.infer<typeof schema>;

export function RegisterPage() {
  const registerMutation = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    await registerMutation.mutateAsync({
      nome: values.name,
      email: values.email,
      password: values.password,
    });
  };

  return (
    <main className="mx-auto grid min-h-screen w-full max-w-6xl items-center gap-8 px-4 py-8 md:grid-cols-2">
      <section className="hidden space-y-4 md:block">
        <p className="inline-flex rounded-full border border-border/70 bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
          Nova conta
        </p>
        <h1 className="text-4xl font-semibold leading-tight">
          Cria o teu acesso e começa em menos de 1 minuto.
        </h1>
        <p className="max-w-md text-base text-muted-foreground">
          Preenche os dados, validação em tempo real e experiência otimizada
          para desktop e mobile.
        </p>
      </section>

      <Card className="w-full max-w-md justify-self-center">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Registar</CardTitle>
          <CardDescription>Crie uma conta para começar.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <label
                className="text-sm font-medium text-foreground/90"
                htmlFor="name"
              >
                Nome
              </label>
              <Input id="name" placeholder="Miguel" {...register("name")} />
              {errors.name && (
                <p className="text-xs text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                className="text-sm font-medium text-foreground/90"
                htmlFor="email"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="email@dominio.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                className="text-sm font-medium text-foreground/90"
                htmlFor="password"
              >
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-xs text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                className="text-sm font-medium text-foreground/90"
                htmlFor="confirmPassword"
              >
                Confirmar password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="********"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-destructive">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button
              className="w-full text-sm font-semibold"
              type="submit"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? "A criar conta..." : "Registar"}
            </Button>
          </form>

          <p className="text-sm text-muted-foreground">
            Já tem conta?{" "}
            <Link
              className="font-medium text-primary hover:underline"
              to="/login"
            >
              Iniciar sessão
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
