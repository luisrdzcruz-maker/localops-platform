"use client";

import { Database, RotateCcw } from "lucide-react";
import { useTransition } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import {
  clearDemoDataAction,
  loadDemoDataAction,
} from "@/lib/demo/actions";

interface DemoToggleBarProps {
  loaded: boolean;
}

export function DemoToggleBar({ loaded }: DemoToggleBarProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <Alert tone="info" title="Modo demo" className="flex items-start justify-between gap-4">
      <div className="flex flex-col gap-1">
        <p>
          {loaded
            ? "Estás viendo datos de demostración deterministas para Farmacia Demo Centro. No representan a una farmacia real."
            : "El almacén de datos está vacío. Carga el dataset de demostración para explorar el panel."}
        </p>
        <p className="text-xs opacity-80">
          PharmaOps no incluye datos de pacientes ni de receta electrónica.
        </p>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        <Button
          type="button"
          variant="primary"
          size="sm"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await loadDemoDataAction();
            })
          }
        >
          <Database className="h-3.5 w-3.5" />
          {loaded ? "Recargar datos demo" : "Cargar datos demo"}
        </Button>
        {loaded ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                await clearDemoDataAction();
              })
            }
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Borrar datos demo
          </Button>
        ) : null}
      </div>
    </Alert>
  );
}
