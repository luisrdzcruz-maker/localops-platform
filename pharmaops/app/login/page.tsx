import { Building2 } from "lucide-react";
import Link from "next/link";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { isDemoMode } from "@/lib/supabase/env";

export const metadata = {
  title: "Iniciar sesión · PharmaOps",
};

export default function LoginPage() {
  const demo = isDemoMode();

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--pharmaops-bg)] px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-ink-200 bg-white p-8 shadow-card">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600 text-white shadow-card">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-brand-600">
              PharmaOps
            </p>
            <h1 className="text-xl font-semibold text-ink-900">
              Iniciar sesión
            </h1>
          </div>
        </div>

        {demo ? (
          <Alert tone="info" title="Modo demo activado" className="mb-6">
            La autenticación real con Supabase está deshabilitada. Entra
            directamente al panel para explorar los datos de la{" "}
            <strong>Farmacia Demo Centro</strong>.
          </Alert>
        ) : null}

        <form className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@farmacia.es"
              autoComplete="email"
              disabled={demo}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              disabled={demo}
            />
          </div>

          <Button type="submit" disabled={demo}>
            Entrar
          </Button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs text-ink-400">
          <span className="h-px flex-1 bg-ink-200" />
          o
          <span className="h-px flex-1 bg-ink-200" />
        </div>

        <Link
          href="/dashboard"
          className="flex w-full items-center justify-center rounded-lg border border-ink-200 bg-white px-4 py-2.5 text-sm font-medium text-ink-700 shadow-card transition hover:bg-ink-50"
        >
          Entrar al panel demo
        </Link>

        <p className="mt-6 text-center text-xs text-ink-500">
          PharmaOps no se conecta a sistemas oficiales de receta electrónica
          ni gestiona datos de pacientes.
        </p>
      </div>
    </main>
  );
}
