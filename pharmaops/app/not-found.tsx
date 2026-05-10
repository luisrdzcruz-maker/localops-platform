import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata = { title: "Página no encontrada · PharmaOps" };

export default function NotFound() {
  return (
    <main className="bg-[var(--pharmaops-bg)]">
      <div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-6 py-16">
        <EmptyState
          icon={<Compass className="h-5 w-5" />}
          title="No encontramos esa página"
          description="Es posible que el enlace haya cambiado o que la sección todavía no esté disponible en esta versión."
          actions={
            <>
              <Link href="/dashboard">
                <Button variant="primary" size="sm">
                  Ir al panel
                </Button>
              </Link>
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
