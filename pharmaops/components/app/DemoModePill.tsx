"use client";

import { ShieldAlert, Sparkles } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { getRuntimeMode } from "@/lib/pharmaops/runtimeMode";

interface DemoModePillProps {
  className?: string;
  /** Hide the leading icon — useful in tight contexts (mobile topbar). */
  compact?: boolean;
}

/**
 * Tiny persistent indicator of the current runtime mode. Lives in the topbar
 * and the mobile header so the user is never confused about whether they're
 * looking at fake or real data.
 *
 * - demo               → blue pill, "Modo demo".
 * - production_stub    → amber pill, "Sin servicios", honest about the gap.
 *
 * Reads NEXT_PUBLIC_* env at build time. No external calls.
 */
export function DemoModePill({ className, compact = false }: DemoModePillProps) {
  const mode = getRuntimeMode();
  const isDemo = mode === "demo";
  const label = isDemo ? "Modo demo" : "Sin servicios";
  const title = isDemo
    ? "Estás viendo datos ficticios deterministas. Nada sale de tu equipo."
    : "La app está en modo producción pero los servicios externos todavía no están conectados.";

  return (
    <span
      title={title}
      aria-label={title}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
        isDemo
          ? "border-status-info/30 bg-status-infoBg text-status-info"
          : "border-status-warn/30 bg-status-warnBg text-amber-900",
        className
      )}
    >
      {!compact ? (
        isDemo ? (
          <Sparkles className="h-3 w-3" aria-hidden="true" />
        ) : (
          <ShieldAlert className="h-3 w-3" aria-hidden="true" />
        )
      ) : null}
      {label}
    </span>
  );
}
