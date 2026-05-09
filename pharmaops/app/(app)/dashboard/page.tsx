import { FileSpreadsheet, FilePieChart, Sparkles } from "lucide-react";
import Link from "next/link";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { DemoToggleBar } from "@/components/dashboard/DemoToggleBar";
import { KpiCards } from "@/components/dashboard/KpiCards";
import { RecentImportsCard } from "@/components/dashboard/RecentImportsCard";
import { SalesVsPurchasesChart } from "@/components/dashboard/SalesVsPurchasesChart";
import { SupplierSpendChart } from "@/components/dashboard/SupplierSpendChart";
import { TasksDueCard } from "@/components/dashboard/TasksDueCard";
import { computeDashboardKpis } from "@/lib/analytics/kpis";
import {
  buildSalesVsPurchasesSeries,
  buildSupplierSpendSeries,
} from "@/lib/analytics/timeseries";
import { getDemoState } from "@/lib/demo/store";

export const metadata = { title: "Panel · PharmaOps" };

export default function DashboardPage() {
  const state = getDemoState();
  const hasData =
    state.salesSummaries.length > 0 || state.purchaseInvoices.length > 0;

  if (!hasData) {
    return (
      <div className="flex flex-col">
        <PageHeader
          eyebrow="Panel"
          title="Control operativo de tu farmacia"
          description="Importa datos, entiende márgenes y prepara informes para tomar mejores decisiones."
        />
        <div className="flex flex-col gap-4 p-6">
          <DemoToggleBar loaded={state.loaded} />
          <EmptyState
            icon={<Sparkles className="h-5 w-5" />}
            title="Sin datos todavía"
            description="Carga el dataset de demostración o sube tu primer Excel/CSV para empezar a ver KPIs, gráficas y tareas sugeridas."
            actions={
              <>
                <Link href="/imports">
                  <Button variant="primary">
                    <FileSpreadsheet className="h-4 w-4" />
                    Importar Excel
                  </Button>
                </Link>
              </>
            }
          />
        </div>
      </div>
    );
  }

  const kpis = computeDashboardKpis(state);
  const salesVsPurchases = buildSalesVsPurchasesSeries(state);
  const supplierSpend = buildSupplierSpendSeries(state);

  return (
    <div className="flex flex-col">
      <PageHeader
        eyebrow="Panel"
        title="Control operativo de tu farmacia"
        description="Importa datos, entiende márgenes y prepara informes para tomar mejores decisiones."
        actions={
          <>
            <Link href="/imports">
              <Button variant="secondary" size="sm">
                <FileSpreadsheet className="h-4 w-4" />
                Importar Excel
              </Button>
            </Link>
            <Link href="/reports">
              <Button variant="primary" size="sm">
                <FilePieChart className="h-4 w-4" />
                Generar informe
              </Button>
            </Link>
          </>
        }
      />

      <div className="flex flex-col gap-6 p-6">
        <DemoToggleBar loaded={state.loaded} />

        <KpiCards kpis={kpis} />

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Ventas vs compras (12 meses)</CardTitle>
              <CardDescription>
                Comparativa mensual a partir de datos importados de ventas y
                facturas de compra. Margen como referencia visual.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SalesVsPurchasesChart data={salesVsPurchases} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gasto por proveedor</CardTitle>
              <CardDescription>Últimos 3 meses, IVA incluido.</CardDescription>
            </CardHeader>
            <CardContent>
              <SupplierSpendChart data={supplierSpend} />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <RecentImportsCard batches={state.importBatches} />
          <TasksDueCard tasks={state.tasks} />
        </div>

        <Alert tone="warn" title="Cifras estimadas">
          Los KPIs y gráficas se basan en los datos importados. PharmaOps no
          sustituye los registros oficiales de tu sistema de farmacia ni la
          contabilidad de tu gestoría.
        </Alert>
      </div>
    </div>
  );
}
