import { ArrowLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Stat } from "@/components/ui/Stat";
import { TBody, TD, TH, THead, TR, Table } from "@/components/ui/Table";
import { SupplierSpendBars } from "@/components/suppliers/SupplierSpendBars";
import { computeSupplierMetrics } from "@/lib/pharmaops/suppliers";
import { getDemoState } from "@/lib/demo/store";
import {
  formatDate,
  formatEur,
  formatNumber,
} from "@/lib/utils/format";
import {
  PAYMENT_STATUS_LABELS,
  type PaymentStatus,
} from "@/types/finance";

const STATUS_TONE: Record<PaymentStatus, "ok" | "warn" | "danger" | "neutral"> = {
  paid: "ok",
  pending: "warn",
  partial: "warn",
  overdue: "danger",
};

export default async function SupplierDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const state = getDemoState();
  const supplier = state.suppliers.find((s) => s.id === id);
  if (!supplier) notFound();

  const metrics = computeSupplierMetrics(supplier, state.purchaseInvoices, {
    monthsForChart: 6,
  });
  const invoices = state.purchaseInvoices
    .filter(
      (i) => i.supplierId === supplier.id || i.supplierName === supplier.name
    )
    .sort((a, b) => (a.invoiceDate < b.invoiceDate ? 1 : -1));

  return (
    <div className="flex flex-col">
      <PageHeader
        eyebrow={
          <span className="flex items-center gap-1 text-ink-500">
            <Link href="/suppliers" className="hover:text-brand-700">
              Proveedores
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span>{supplier.name}</span>
          </span>
        }
        title={supplier.name}
        description={
          [
            supplier.contactPerson,
            supplier.email,
            supplier.phone,
          ]
            .filter(Boolean)
            .join(" · ") || "Sin información de contacto."
        }
        actions={
          <Link href="/suppliers">
            <Button variant="secondary" size="sm">
              <ArrowLeft className="h-3.5 w-3.5" />
              Volver
            </Button>
          </Link>
        }
      />

      <div className="flex flex-col gap-6 p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Stat
            label="Gasto acumulado"
            value={formatEur(metrics.totalSpend)}
            hint={`${metrics.invoiceCount} facturas`}
          />
          <Stat
            label="Pendiente de pago"
            value={formatEur(metrics.pendingAmount)}
            hint={`${metrics.pendingCount} facturas`}
          />
          <Stat
            label="Vencido"
            value={formatEur(metrics.overdueAmount)}
            hint={`${metrics.overdueCount} facturas`}
          />
          <Stat
            label="Plazo medio"
            value={
              metrics.averagePaymentTermsDays !== null
                ? `${metrics.averagePaymentTermsDays} días`
                : "—"
            }
            hint={`Última factura ${formatDate(metrics.lastInvoiceDate)}`}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle>Gasto últimos 6 meses</CardTitle>
                  <CardDescription>
                    Tendencia mensual de facturación bruta con este proveedor.
                  </CardDescription>
                </div>
                <div className="flex shrink-0 gap-4 text-right">
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wide text-ink-500">
                      Total ventana
                    </p>
                    <p className="text-sm font-semibold text-ink-900">
                      {formatEur(metrics.chartTotal)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wide text-ink-500">
                      Media mensual
                    </p>
                    <p className="text-sm font-semibold text-ink-900">
                      {formatEur(metrics.chartAverage)}
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {metrics.invoiceCount === 0 ? (
                <p className="text-sm text-ink-500">Sin facturas aún.</p>
              ) : (
                <SupplierSpendBars data={metrics.spendByMonth} />
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Datos del proveedor</CardTitle>
              <CardDescription>Información administrativa.</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="flex flex-col gap-3 text-sm">
                <DefRow label="NIF/CIF" value={supplier.taxId} />
                <DefRow label="Email" value={supplier.email} />
                <DefRow label="Teléfono" value={supplier.phone} />
                <DefRow label="Persona contacto" value={supplier.contactPerson} />
                <DefRow
                  label="Plazo de pago"
                  value={
                    supplier.paymentTermsDays !== null
                      ? `${supplier.paymentTermsDays} días`
                      : null
                  }
                />
                <DefRow
                  label="Estado"
                  value={
                    supplier.status === "active"
                      ? "Activo"
                      : supplier.status === "blocked"
                      ? "Bloqueado"
                      : "Inactivo"
                  }
                />
                {supplier.notes ? (
                  <div className="rounded-lg bg-ink-50 p-3 text-xs text-ink-600">
                    {supplier.notes}
                  </div>
                ) : null}
              </dl>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Facturas</CardTitle>
            <CardDescription>
              {formatNumber(invoices.length)} facturas registradas en este
              proveedor.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {invoices.length === 0 ? (
              <p className="text-sm text-ink-500">Sin facturas registradas.</p>
            ) : (
              <Table>
                <THead>
                  <TR>
                    <TH>Nº factura</TH>
                    <TH>Fecha</TH>
                    <TH>Vencimiento</TH>
                    <TH className="text-right">Base</TH>
                    <TH className="text-right">IVA</TH>
                    <TH className="text-right">Total</TH>
                    <TH>Estado</TH>
                  </TR>
                </THead>
                <TBody>
                  {invoices.slice(0, 50).map((inv) => (
                    <TR key={inv.id}>
                      <TD className="font-medium text-ink-900">
                        {inv.invoiceNumber}
                      </TD>
                      <TD>{formatDate(inv.invoiceDate)}</TD>
                      <TD>{formatDate(inv.dueDate)}</TD>
                      <TD className="text-right">{formatEur(inv.netAmount)}</TD>
                      <TD className="text-right">{formatEur(inv.vatAmount)}</TD>
                      <TD className="text-right font-medium">
                        {formatEur(inv.grossAmount)}
                      </TD>
                      <TD>
                        <Badge
                          tone={STATUS_TONE[inv.paymentStatus]}
                          className="text-[10px]"
                        >
                          {PAYMENT_STATUS_LABELS[inv.paymentStatus]}
                        </Badge>
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DefRow({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">
        {label}
      </dt>
      <dd className="text-right text-ink-900">
        {value === null || value === undefined || value === "" ? "—" : value}
      </dd>
    </div>
  );
}
