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
  REPORT_STATUS_LABELS,
  REPORT_TYPE_LABELS,
  type Report,
  type ReportStatus,
  type ReportType,
} from "@/types/reports";
import { formatDate, formatRelative } from "@/lib/utils/format";

const STATUS_TONE: Record<ReportStatus, "ok" | "warn" | "danger" | "info"> = {
  queued: "info",
  generating: "warn",
  ready: "ok",
  failed: "danger",
};

export function GeneratedReportsTable({ reports }: { reports: Report[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informes generados</CardTitle>
        <CardDescription>
          Histórico de informes solicitados desde esta sesión y datos demo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {reports.length === 0 ? (
          <p className="text-sm text-ink-500">Aún no hay informes generados.</p>
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>Informe</TH>
                <TH>Periodo</TH>
                <TH>Formato</TH>
                <TH>Estado</TH>
                <TH>Generado</TH>
                <TH>Fichero</TH>
              </TR>
            </THead>
            <TBody>
              {reports.slice(0, 25).map((r) => (
                <TR key={r.id}>
                  <TD className="font-medium text-ink-900">
                    {REPORT_TYPE_LABELS[r.reportType as ReportType] ??
                      r.reportType}
                  </TD>
                  <TD className="text-xs text-ink-500">
                    {formatDate(r.periodStart)} – {formatDate(r.periodEnd)}
                  </TD>
                  <TD className="text-xs uppercase text-ink-500">
                    {r.format}
                  </TD>
                  <TD>
                    <Badge tone={STATUS_TONE[r.status]} className="text-[10px]">
                      {REPORT_STATUS_LABELS[r.status]}
                    </Badge>
                  </TD>
                  <TD className="text-xs text-ink-500">
                    {formatRelative(r.createdAt)}
                  </TD>
                  <TD className="max-w-[260px] truncate text-xs text-ink-600">
                    {r.filename}
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
