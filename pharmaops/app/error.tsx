"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";

/**
 * Route-level error boundary for the public landing.
 *
 * We intentionally surface a generic Spanish message and never leak the raw
 * Error object — this page can be reached by anyone on the public domain.
 * The `reset()` callback lets the user retry the failing segment without a
 * full page reload.
 */
export default function PublicError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="bg-[var(--pharmaops-bg)]">
      <div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-6 py-16">
        <ErrorState
          title="Algo no ha cargado bien"
          description="Hemos registrado el error y estamos trabajando en ello. Vuelve a intentarlo en unos segundos o navega a otra sección."
          actions={
            <>
              <Button onClick={reset} variant="primary" size="sm">
                Reintentar
              </Button>
              <Link href="/">
                <Button variant="secondary" size="sm">
                  Volver al inicio
                </Button>
              </Link>
            </>
          }
        />
      </div>
    </main>
  );
}
