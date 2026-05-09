import { Truck } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { Stat } from "@/components/ui/Stat";
import { SuppliersTable } from "@/components/suppliers/SuppliersTable";
import { computeAllSupplierMetrics } from "@/lib/pharmaops/suppliers";
import { getDemoState } from "@/lib/demo/store";
import { formatEur, formatNumber } from "@/lib/utils/format";

export const metadata = { title: "Proveedores · PharmaOps" };

export default function SuppliersPage() {
  const state = getDemoState();
  const metrics = computeAllSupplierMetrics(
    state.suppliers,
    state.purchaseInvoices
  );

  const totalSpend = metrics.reduce((acc, m) => acc + m.totalSpend, 0);
  const pendingTotal = metrics.reduce((acc, m) => acc + m.pendingAmount, 0);
  const overdueTotal = metrics.reduce((acc, m) => acc + m.overdueAmount, 0);

  if (metrics.length === 0) {
    return (
      <div className="flex flex-col">
        <PageHeader
          eyebrow="Proveedores"
          title="Proveedores y gasto"
          description="Controla a quién compras, cuánto, y con qué condiciones de pago."
        />
        <div className="p-6">
          <EmptyState
            icon={<Truck className="h-5 w-5" />}
            title="No hay proveedores cargados"
            description="Importa facturas de compra o un fichero de proveedores desde el centro de importaciones para empezar a ver gasto, plazos y facturas pendientes."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        eyebrow="Proveedores"
        title="Proveedores y gasto"
        description="Controla a quién compras, cuánto, y con qué condiciones de pago."
      />
      <div className="flex flex-col gap-6 p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Stat
            label="Proveedores activos"
            value={formatNumber(
              metrics.filter((m) => m.supplier.status === "active").length
            )}
            hint={`${metrics.length} en total`}
          />
          <Stat
            label="Gasto acumulado"
            value={formatEur(totalSpend)}
            hint="Total bruto registrado"
          />
          <Stat
            label="Pendiente de pago"
            value={formatEur(pendingTotal)}
            hint={`${metrics.reduce((acc, m) => acc + m.pendingCount, 0)} facturas`}
          />
          <Stat
            label="Vencidas"
            value={formatEur(overdueTotal)}
            hint={`${metrics.reduce((acc, m) => acc + m.overdueCount, 0)} facturas`}
          />
        </div>
        <SuppliersTable metrics={metrics} />
      </div>
    </div>
  );
}
