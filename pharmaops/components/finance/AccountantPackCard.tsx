import { FilePieChart } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { TBody, TD, TH, THead, TR, Table } from "@/components/ui/Table";
import {
  ACCOUNTING_CATEGORY_LABELS,
  type AccountantPack,
} from "@/types/finance";
import { formatDate, formatEur } from "@/lib/utils/format";

export function AccountantPackCard({ pack }: { pack: AccountantPack }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FilePieChart className="h-4 w-4 text-brand-600" />
              Paquete para gestoría
            </CardTitle>
            <CardDescription>
              Resumen agregado por categoría {formatDate(pack.periodStart)} –
              {" "}{formatDate(pack.periodEnd)}.
            </CardDescription>
          </div>
          <Link href="/reports">
            <Button size="sm" variant="primary">
              Generar PDF / Excel
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {pack.entries.length === 0 ? (
          <p className="text-sm text-ink-500">
            Sin movimientos en el periodo seleccionado.
          </p>
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>Categoría</TH>
                <TH className="text-right">Movimientos</TH>
                <TH className="text-right">Base</TH>
                <TH className="text-right">IVA</TH>
                <TH className="text-right">Total</TH>
              </TR>
            </THead>
            <TBody>
              {pack.entries.map((e) => (
                <TR key={e.category}>
                  <TD className="font-medium text-ink-900">
                    {ACCOUNTING_CATEGORY_LABELS[e.category] ?? e.category}
                  </TD>
                  <TD className="text-right">{e.count}</TD>
                  <TD className="text-right">{formatEur(e.totalNet)}</TD>
                  <TD className="text-right">{formatEur(e.totalVat)}</TD>
                  <TD className="text-right font-semibold">
                    {formatEur(e.totalGross)}
                  </TD>
                </TR>
              ))}
              <TR className="border-t-2 border-ink-200 bg-ink-50">
                <TD className="font-semibold text-ink-900">Totales</TD>
                <TD className="text-right font-semibold">—</TD>
                <TD className="text-right font-semibold">
                  {formatEur(pack.totals.totalNet)}
                </TD>
                <TD className="text-right font-semibold">
                  {formatEur(pack.totals.totalVat)}
                </TD>
                <TD className="text-right text-base font-semibold text-brand-700">
                  {formatEur(pack.totals.totalGross)}
                </TD>
              </TR>
            </TBody>
          </Table>
        )}
      </CardContent>
      <CardFooter className="text-xs text-ink-500">
        {pack.disclaimer}
      </CardFooter>
    </Card>
  );
}
