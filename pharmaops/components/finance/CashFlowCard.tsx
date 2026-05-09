import { ArrowDownRight, ArrowUpRight, Wallet } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import type { CashFlowEstimate } from "@/types/finance";
import { formatDate, formatEur } from "@/lib/utils/format";

export function CashFlowCard({ estimate }: { estimate: CashFlowEstimate }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-brand-600" />
          Flujo de caja estimado (30 días)
        </CardTitle>
        <CardDescription>
          Estimación basada en facturas pendientes y gastos recurrentes.
          {" "}{formatDate(estimate.periodStart)} – {formatDate(estimate.periodEnd)}.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-status-ok/20 bg-status-okBg/60 p-3">
          <p className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-status-ok">
            <ArrowUpRight className="h-3 w-3" />
            Entradas estimadas
          </p>
          <p className="mt-1 text-lg font-semibold text-status-ok">
            {formatEur(estimate.estimatedInflow)}
          </p>
        </div>
        <div className="rounded-lg border border-status-danger/20 bg-status-dangerBg/60 p-3">
          <p className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-red-900">
            <ArrowDownRight className="h-3 w-3" />
            Salidas estimadas
          </p>
          <p className="mt-1 text-lg font-semibold text-red-900">
            {formatEur(estimate.estimatedOutflow)}
          </p>
          <p className="mt-1 text-[11px] text-red-900/80">
            Pendiente proveedores: {formatEur(estimate.pendingSupplierInvoices)} ·
            Recurrentes: {formatEur(estimate.recurringExpenses)}
          </p>
        </div>
        <div className="rounded-lg border border-brand-200 bg-brand-50 p-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-brand-700">
            Neto estimado
          </p>
          <p className="mt-1 text-lg font-semibold text-brand-700">
            {formatEur(estimate.estimatedNet)}
          </p>
        </div>
      </CardContent>
      <CardFooter className="text-xs text-ink-500">
        {estimate.disclaimer}
      </CardFooter>
    </Card>
  );
}
