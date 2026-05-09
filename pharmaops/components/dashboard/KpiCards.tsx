import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CircleDollarSign,
  Package,
  Receipt,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { Stat } from "@/components/ui/Stat";
import { Badge } from "@/components/ui/Badge";
import type { DashboardKpis, MonthlyKpi } from "@/lib/analytics/kpis";
import { formatEur, formatNumber, formatPercent } from "@/lib/utils/format";

function trendBadge(kpi: MonthlyKpi) {
  if (kpi.currentIsPartial) {
    return (
      <Badge tone="info" className="text-[10px]">
        parcial
      </Badge>
    );
  }
  if (kpi.changeRatio === null) return null;
  const positive = kpi.changeRatio >= 0;
  return (
    <Badge tone={positive ? "ok" : "danger"} className="gap-0.5 text-[10px]">
      {positive ? (
        <ArrowUpRight className="h-3 w-3" />
      ) : (
        <ArrowDownRight className="h-3 w-3" />
      )}
      {formatPercent(Math.abs(kpi.changeRatio))}
    </Badge>
  );
}

function revenueHint(kpi: MonthlyKpi): string {
  if (kpi.currentIsPartial) {
    return kpi.previous !== null
      ? `Mes en curso · mes anterior ${formatEur(kpi.previous)}`
      : "Mes en curso — datos parciales";
  }
  return kpi.previous !== null
    ? `Mes anterior · ${formatEur(kpi.previous)}`
    : "Sin histórico todavía";
}

export function KpiCards({ kpis }: { kpis: DashboardKpis }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Stat
        label={
          <span className="flex items-center gap-1.5">
            <CircleDollarSign className="h-3.5 w-3.5 text-brand-600" />
            Ventas (mes actual)
          </span>
        }
        value={formatEur(kpis.revenueThisMonth.current)}
        hint={revenueHint(kpis.revenueThisMonth)}
        trailing={trendBadge(kpis.revenueThisMonth)}
      />
      <Stat
        label={
          <span className="flex items-center gap-1.5">
            <ShoppingBag className="h-3.5 w-3.5 text-brand-600" />
            Compras (mes actual)
          </span>
        }
        value={formatEur(kpis.purchasesThisMonth.current)}
        hint={revenueHint(kpis.purchasesThisMonth)}
        trailing={trendBadge(kpis.purchasesThisMonth)}
      />
      <Stat
        label={
          <span className="flex items-center gap-1.5">
            <Receipt className="h-3.5 w-3.5 text-brand-600" />
            Margen bruto estimado
          </span>
        }
        value={
          kpis.grossMargin.current === null
            ? "No disponible"
            : formatPercent(kpis.grossMargin.current)
        }
        hint={
          kpis.grossMargin.currentIsPartial
            ? "Mes en curso — datos parciales"
            : kpis.grossMargin.previous === null
            ? "Estimación basada en datos importados"
            : `Mes anterior · ${formatPercent(kpis.grossMargin.previous)}`
        }
      />
      <Stat
        label={
          <span className="flex items-center gap-1.5">
            <Truck className="h-3.5 w-3.5 text-brand-600" />
            Top proveedor
          </span>
        }
        value={kpis.topSupplierName ?? "—"}
        hint={
          kpis.topSupplierAmount === null
            ? "Sin facturas"
            : `${formatEur(kpis.topSupplierAmount)} acumulado`
        }
      />

      <Stat
        label="Facturas pendientes"
        value={formatNumber(kpis.pendingSupplierInvoicesCount)}
        hint={`${formatEur(kpis.pendingSupplierInvoicesAmount)} pendientes`}
        trailing={
          kpis.overdueSupplierInvoicesCount > 0 ? (
            <Badge tone="danger" className="gap-1 text-[10px]">
              <AlertTriangle className="h-3 w-3" />
              {kpis.overdueSupplierInvoicesCount} vencidas
            </Badge>
          ) : null
        }
      />
      <Stat
        label="Riesgo en stock"
        value={formatNumber(kpis.stockRiskItems)}
        hint={`Valor de stock ${formatEur(kpis.stockValue)}`}
        trailing={
          kpis.stockRiskItems > 0 ? (
            <Badge tone="warn" className="gap-1 text-[10px]">
              <Package className="h-3 w-3" />
              referencias
            </Badge>
          ) : null
        }
      />
      <Stat
        label="Salud de importaciones"
        value={`${kpis.importHealthValid} OK`}
        hint={`${kpis.importHealthErrors} errores · ${kpis.importHealthWarnings} avisos`}
        trailing={
          kpis.importHealthErrors > 0 ? (
            <Badge tone="danger" className="text-[10px]">
              revisar
            </Badge>
          ) : (
            <Badge tone="ok" className="text-[10px]">
              ok
            </Badge>
          )
        }
      />
      <Stat
        label="Tareas esta semana"
        value={formatNumber(kpis.tasksDueThisWeek)}
        hint={`${kpis.reportsLast30Days} informes generados (30 días)`}
      />
    </div>
  );
}
