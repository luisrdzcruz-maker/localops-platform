"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";

/**
 * Route-level error boundary for authenticated routes. Keeps the AppShell
 * (sidebar + topbar) mounted thanks to the (app)/layout.tsx wrapper, and
 * renders a friendly Spanish message instead of the raw Next.js error UI.
 */
export default function AppError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col">
      <div className="p-6">
        <ErrorState
          title="No hemos podido cargar esta vista"
          description="Es probable que sea un problema temporal con los datos demo o con un cálculo derivado. Reintenta o vuelve al panel."
          actions={
            <>
              <Button onClick={reset} variant="primary" size="sm">
                Reintentar
              </Button>
              <Link href="/dashboard">
                <Button variant="secondary" size="sm">
                  Ir al panel
                </Button>
              </Link>
            </>
          }
        />
      </div>
    </div>
  );
}
