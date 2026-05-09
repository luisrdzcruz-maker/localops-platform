import { Alert } from "@/components/ui/Alert";
import { PageHeader } from "@/components/ui/PageHeader";
import { Stat } from "@/components/ui/Stat";
import { AccountantPackCard } from "@/components/finance/AccountantPackCard";
import { AddExpenseForm } from "@/components/finance/AddExpenseForm";
import { CashFlowCard } from "@/components/finance/CashFlowCard";
import { ExpensesTable } from "@/components/finance/ExpensesTable";
import { VatSummaryCard } from "@/components/finance/VatSummaryCard";
import {
  computeAccountantPack,
  computeCashFlowEstimate,
  computeVatSummary,
} from "@/lib/pharmaops/finance";
import { getDemoState } from "@/lib/demo/store";
import { formatEur, formatNumber } from "@/lib/utils/format";

export const metadata = { title: "Finanzas · PharmaOps" };

export default function FinancePage() {
  const state = getDemoState();
  const vat = computeVatSummary(state.purchaseInvoices, state.salesSummaries);
  const cashflow = computeCashFlowEstimate(
    state.purchaseInvoices,
    state.expenses
  );
  const pack = computeAccountantPack(
    state.pharmacy.id,
    state.purchaseInvoices,
    state.expenses
  );

  const totalExpensesYTD = state.expenses.reduce(
    (acc, e) => acc + e.grossAmount,
    0
  );
  const pendingPayments = state.purchaseInvoices
    .filter(
      (i) => i.paymentStatus === "pending" || i.paymentStatus === "partial"
    )
    .reduce((acc, i) => acc + i.grossAmount, 0);

  return (
    <div className="flex flex-col">
      <PageHeader
        eyebrow="Finanzas"
        title="Gestión financiera"
        description="Gastos, IVA estimado, flujo de caja estimado y paquete para gestoría."
      />
      <div className="flex flex-col gap-6 p-6">
        <Alert tone="warn" title="Datos estimados">
          Las cifras de esta sección son una herramienta de gestión a partir de
          los datos importados. No sustituyen a tu gestoría ni a la
          contabilidad oficial. Revisa con tu asesor antes de cualquier
          presentación fiscal.
        </Alert>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Stat
            label="Gastos registrados"
            value={formatEur(totalExpensesYTD)}
            hint={`${formatNumber(state.expenses.length)} líneas`}
          />
          <Stat
            label="IVA neto estimado"
            value={formatEur(vat.netVat)}
            hint={`Periodo de 3 meses`}
          />
          <Stat
            label="Pendiente proveedores"
            value={formatEur(pendingPayments)}
            hint="Pagos por hacer"
          />
          <Stat
            label="Flujo neto (30 días)"
            value={formatEur(cashflow.estimatedNet)}
            hint="Estimación cualitativa"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <VatSummaryCard summary={vat} />
          <CashFlowCard estimate={cashflow} />
        </div>

        <AccountantPackCard pack={pack} />

        <AddExpenseForm />
        <ExpensesTable expenses={state.expenses} />
      </div>
    </div>
  );
}
