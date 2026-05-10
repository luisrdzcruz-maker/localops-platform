import { ArrowRight, Receipt } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import type { DocumentMetrics } from "@/lib/pharmaops/documents";
import { formatNumber } from "@/lib/utils/format";

/**
 * Compact dashboard card that exposes the key Documentos counters without
 * disturbing the existing KPI grid. Three numbers in a row, link to the
 * full /documents page.
 */
export function DocumentsSummary({ metrics }: { metrics: DocumentMetrics }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <CardTitle className="flex items-center gap-2 truncate">
              <Receipt className="h-4 w-4 shrink-0 text-brand-600" />
              <span className="truncate">Documentos</span>
            </CardTitle>
            <CardDescription className="hidden sm:block">
              Facturas, tickets, albaranes y documentos para gestoría.
            </CardDescription>
          </div>
          <Link
            href="/documents"
            className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-brand-700 hover:underline"
          >
            <span className="hidden sm:inline">Ir a documentos</span>
            <span className="sm:hidden">Ver</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Counter
            label="Pendientes"
            value={metrics.pendingReview}
            tone="warn"
          />
          <Counter
            label="Facturas por revisar"
            value={metrics.invoicesPendingReview}
            tone="info"
          />
          <Counter
            label="Extracciones por revisar"
            value={metrics.extractionsPendingReview}
            tone="info"
          />
          <Counter
            label="Listos para gestoría"
            value={metrics.readyForAccountant}
            tone="ok"
          />
        </div>
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
  tone: "warn" | "info" | "ok";
}) {
  const toneClass = {
    warn: "border-status-warn/20 bg-status-warnBg/60 text-amber-900",
    info: "border-status-info/20 bg-status-infoBg text-status-info",
    ok: "border-status-ok/20 bg-status-okBg/60 text-status-ok",
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
