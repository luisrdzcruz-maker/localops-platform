import { ArrowRight, ClipboardList } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import type { DeliveryNoteMetrics } from "@/lib/pharmaops/deliveryNotes";
import { formatEur, formatNumber } from "@/lib/utils/format";

/**
 * Compact dashboard signal for the Albaranes workflow. Mirrors the shape of
 * DocumentsSummary so the two cards feel like part of the same dashboard
 * row. Surfaces the two numbers the pharmacy team checks first thing in the
 * morning: pendientes y con incidencias.
 */
export function DeliveryNotesSignal({
  metrics,
}: {
  metrics: DeliveryNoteMetrics;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <CardTitle className="flex items-center gap-2 truncate">
              <ClipboardList className="h-4 w-4 shrink-0 text-brand-600" />
              <span className="truncate">Albaranes</span>
            </CardTitle>
            <CardDescription className="hidden sm:block">
              Albaranes pendientes y con incidencias del registro de demo.
            </CardDescription>
          </div>
          <Link
            href="/documents"
            className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-brand-700 hover:underline"
          >
            <span className="hidden sm:inline">Ir a albaranes</span>
            <span className="sm:hidden">Ver</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Counter
            label="Pendientes"
            value={metrics.pending}
            tone="warn"
          />
          <Counter
            label="Con incidencias"
            value={metrics.withIssues}
            tone="danger"
          />
          <Counter
            label="Pendientes factura"
            value={metrics.awaitingInvoice}
            tone="info"
          />
          <Counter
            label="Asociados"
            value={metrics.matchedToInvoice}
            tone="ok"
          />
        </div>
        {metrics.estimatedAmountPendingInvoice > 0 ? (
          <p className="mt-3 text-[11px] text-ink-500">
            Importe estimado pendiente de factura:{" "}
            <span className="font-medium text-ink-700">
              {formatEur(metrics.estimatedAmountPendingInvoice)}
            </span>
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function Counter({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "warn" | "info" | "ok" | "danger";
}) {
  const toneClass = {
    warn: "border-status-warn/20 bg-status-warnBg/60 text-amber-900",
    info: "border-status-info/20 bg-status-infoBg text-status-info",
    ok: "border-status-ok/20 bg-status-okBg/60 text-status-ok",
    danger: "border-status-danger/20 bg-status-dangerBg/60 text-red-900",
  }[tone];
  return (
    <div
      className={`flex min-w-0 flex-col gap-1 overflow-hidden rounded-lg border ${toneClass} p-3`}
    >
      <p className="truncate text-[10px] font-medium uppercase tracking-wide opacity-80">
        {label}
      </p>
      <p className="truncate text-xl font-semibold">{formatNumber(value)}</p>
    </div>
  );
}
