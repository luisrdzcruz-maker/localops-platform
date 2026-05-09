"use client";

import { useState } from "react";
import { useObraStoreActions } from "@/lib/store/sessionStore";
import { RotateCcwIcon } from "./icons";

export function DemoResetCard() {
  const { reset } = useObraStoreActions();
  const [justReset, setJustReset] = useState(false);

  const handleReset = () => {
    if (typeof window !== "undefined") {
      const confirmed = window.confirm(
        "¿Resetear la demo? Volverás a los datos iniciales de ObraRentable y se descartarán las obras, gastos, cobros y tickets que hayas creado en esta sesión."
      );
      if (!confirmed) return;
    }
    reset();
    setJustReset(true);
    setTimeout(() => setJustReset(false), 2500);
  };

  return (
    <section
      aria-label="Modo demo"
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Modo demo</p>
          <p className="mt-1 text-sm text-slate-700">Los datos se guardan solo en esta sesión.</p>
          <p className="mt-0.5 text-xs text-slate-500">
            Al recargar la pestaña los cambios se mantienen, pero al cerrar el navegador se pierden.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {justReset ? (
            <span className="text-xs font-medium text-rentable-healthy">Datos restablecidos.</span>
          ) : null}
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-obra-300 hover:text-obra-700"
          >
            <RotateCcwIcon className="h-3.5 w-3.5" />
            Resetear demo
          </button>
        </div>
      </div>
    </section>
  );
}
