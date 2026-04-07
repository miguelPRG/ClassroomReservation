import { Outlet } from "react-router-dom";

export function AppShell() {
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Secretaria</p>
            <h1 className="text-xl font-semibold">Sistema de Reservas de Salas</h1>
          </div>
          <span className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground">
            Dark Theme
          </span>
        </div>
      </header>
      <section className="mx-auto w-full max-w-5xl px-4 py-6">
        <Outlet />
      </section>
    </main>
  );
}
