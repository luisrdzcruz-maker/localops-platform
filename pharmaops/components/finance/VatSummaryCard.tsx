import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { TBody, TD, TH, THead, TR, Table } from "@/components/ui/Table";
import type { VatPeriodSummary } from "@/types/finance";
import { formatDate, formatEur } from "@/lib/utils/format";

export function VatSummaryCard({ summary }: { summary: VatPeriodSummary }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumen de IVA estimado</CardTitle>
        <CardDescription>
          Periodo {formatDate(summary.periodStart)} – {formatDate(summary.periodEnd)}.
          IVA repercutido (ventas) menos IVA soportado (compras + gastos).
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-status-okBg/60 p-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-status-ok">
              IVA repercutido
            </p>
            <p className="mt-1 text-lg font-semibold text-status-ok">
              {formatEur(summary.outputVat)}
            </p>
          </div>
          <div className="rounded-lg bg-status-infoBg/70 p-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-status-info">
              IVA soportado
            </p>
            <p className="mt-1 text-lg font-semibold text-status-info">
              {formatEur(summary.inputVat)}
            </p>
          </div>
          <div className="rounded-lg bg-brand-50 p-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-brand-700">
              IVA neto a ingresar
            </p>
            <p className="mt-1 text-lg font-semibold text-brand-700">
              {formatEur(summary.netVat)}
            </p>
          </div>
        </div>

        <Table>
          <THead>
            <TR>
              <TH>Tipo IVA</TH>
              <TH className="text-right">Repercutido</TH>
              <TH className="text-right">Soportado</TH>
              <TH className="text-right">Neto</TH>
            </TR>
          </THead>
          <TBody>
            {summary.byRate.map((r) => (
              <TR key={r.rate}>
                <TD className="font-medium">{r.rate}%</TD>
                <TD className="text-right">{formatEur(r.outputVat)}</TD>
                <TD className="text-right">{formatEur(r.inputVat)}</TD>
                <TD className="text-right font-medium">
                  {formatEur(r.outputVat - r.inputVat)}
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </CardContent>
      <CardFooter className="text-xs text-ink-500">
        {summary.disclaimer}
      </CardFooter>
    </Card>
  );
}
