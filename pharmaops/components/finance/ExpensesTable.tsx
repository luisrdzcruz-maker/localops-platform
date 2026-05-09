import { Badge } from "@/components/ui/Badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { TBody, TD, TH, THead, TR, Table } from "@/components/ui/Table";
import {
  ACCOUNTING_CATEGORY_LABELS,
  PAYMENT_STATUS_LABELS,
  type AccountingCategory,
  type Expense,
  type PaymentStatus,
} from "@/types/finance";
import { formatDate, formatEur } from "@/lib/utils/format";

const STATUS_TONE: Record<PaymentStatus, "ok" | "warn" | "danger" | "neutral"> = {
  paid: "ok",
  pending: "warn",
  partial: "warn",
  overdue: "danger",
};

export function ExpensesTable({ expenses }: { expenses: Expense[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gastos</CardTitle>
        <CardDescription>
          Gastos operativos: alquiler, suministros, gestoría, software, marketing,
          servicios profesionales, etc. Importa o añade manualmente.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {expenses.length === 0 ? (
          <p className="text-sm text-ink-500">Sin gastos registrados.</p>
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>Fecha</TH>
                <TH>Emisor</TH>
                <TH>Concepto</TH>
                <TH>Categoría</TH>
                <TH className="text-right">Base</TH>
                <TH className="text-right">IVA</TH>
                <TH className="text-right">Total</TH>
                <TH>Estado</TH>
              </TR>
            </THead>
            <TBody>
              {expenses.slice(0, 50).map((e) => (
                <TR key={e.id}>
                  <TD>{formatDate(e.date)}</TD>
                  <TD className="font-medium text-ink-900">{e.vendor}</TD>
                  <TD className="max-w-[280px] truncate text-ink-600">
                    {e.description}
                  </TD>
                  <TD className="text-xs text-ink-500">
                    {ACCOUNTING_CATEGORY_LABELS[e.category as AccountingCategory] ?? e.category}
                  </TD>
                  <TD className="text-right">{formatEur(e.netAmount)}</TD>
                  <TD className="text-right">{formatEur(e.vatAmount)}</TD>
                  <TD className="text-right font-medium">{formatEur(e.grossAmount)}</TD>
                  <TD>
                    <Badge tone={STATUS_TONE[e.paymentStatus]} className="text-[10px]">
                      {PAYMENT_STATUS_LABELS[e.paymentStatus]}
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
