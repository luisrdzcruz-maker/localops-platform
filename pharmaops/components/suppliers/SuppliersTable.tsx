import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { TBody, TD, TH, THead, TR, Table } from "@/components/ui/Table";
import type { SupplierMetrics } from "@/lib/pharmaops/suppliers";
import { formatDate, formatEur, formatNumber } from "@/lib/utils/format";

interface Props {
  metrics: SupplierMetrics[];
}

export function SuppliersTable({ metrics }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Proveedores</CardTitle>
        <CardDescription>
          Ordenados por gasto acumulado. Haz clic en una fila para ver el
          detalle completo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {metrics.length === 0 ? (
          <p className="text-sm text-ink-500">
            No hay proveedores. Importa facturas o un fichero de proveedores
            desde el centro de importaciones.
          </p>
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>Proveedor</TH>
                <TH>NIF</TH>
                <TH>Plazo (días)</TH>
                <TH className="text-right">Gasto</TH>
                <TH className="text-right">Facturas</TH>
                <TH className="text-right">Pendiente</TH>
                <TH>Última factura</TH>
                <TH>Estado</TH>
              </TR>
            </THead>
            <TBody>
              {metrics.map((m) => (
                <TR key={m.supplier.id}>
                  <TD>
                    <Link
                      href={`/suppliers/${m.supplier.id}`}
                      className="font-medium text-ink-900 hover:text-brand-700 hover:underline"
                    >
                      {m.supplier.name}
                    </Link>
                    {m.supplier.preferred ? (
                      <Badge tone="brand" className="ml-2 text-[10px]">
                        Preferente
                      </Badge>
                    ) : null}
                  </TD>
                  <TD className="text-xs text-ink-500">
                    {m.supplier.taxId ?? "—"}
                  </TD>
                  <TD>{m.averagePaymentTermsDays ?? m.supplier.paymentTermsDays ?? "—"}</TD>
                  <TD className="text-right font-medium text-ink-900">
                    {formatEur(m.totalSpend)}
                  </TD>
                  <TD className="text-right">{formatNumber(m.invoiceCount)}</TD>
                  <TD className="text-right">
                    <span className={m.pendingAmount > 0 ? "text-status-warn" : "text-ink-500"}>
                      {formatEur(m.pendingAmount)}
                    </span>
                    {m.overdueCount > 0 ? (
                      <span className="ml-1 text-xs text-status-danger">
                        ({m.overdueCount} venc.)
                      </span>
                    ) : null}
                  </TD>
                  <TD className="text-xs text-ink-500">
                    {formatDate(m.lastInvoiceDate)}
                  </TD>
                  <TD>
                    <Badge
                      tone={
                        m.supplier.status === "active"
                          ? "ok"
                          : m.supplier.status === "blocked"
                          ? "danger"
                          : "neutral"
                      }
                      className="text-[10px]"
                    >
                      {m.supplier.status === "active"
                        ? "Activo"
                        : m.supplier.status === "blocked"
                        ? "Bloqueado"
                        : "Inactivo"}
                    </Badge>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
