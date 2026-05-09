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
  IMPORT_BATCH_STATUS_LABELS,
  IMPORT_TYPE_LABELS,
  SOURCE_SYSTEM_LABELS,
  type ImportBatch,
  type ImportBatchStatus,
} from "@/types/imports";
import { formatRelative } from "@/lib/utils/format";

const STATUS_TONE: Record<ImportBatchStatus, "ok" | "warn" | "danger" | "info"> = {
  uploaded: "info",
  detected: "info",
  mapping: "warn",
  validated: "warn",
  confirmed: "ok",
  failed: "danger",
};

export function ImportBatchList({ batches }: { batches: ImportBatch[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de importaciones</CardTitle>
        <CardDescription>
          Cada fila representa un lote (un fichero subido) con el detalle de
          filas válidas, errores y avisos detectados durante la validación.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {batches.length === 0 ? (
          <p className="text-sm text-ink-500">Aún no hay importaciones.</p>
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>Fichero</TH>
                <TH>Sistema</TH>
                <TH>Tipo</TH>
                <TH className="text-right">Filas</TH>
                <TH>Estado</TH>
                <TH>Subido</TH>
              </TR>
            </THead>
            <TBody>
              {batches.map((b) => (
                <TR key={b.id}>
                  <TD className="max-w-[260px] truncate font-medium text-ink-900">
                    {b.originalFilename}
                  </TD>
                  <TD>{SOURCE_SYSTEM_LABELS[b.sourceSystem]}</TD>
                  <TD>
                    {IMPORT_TYPE_LABELS[
                      b.importType as keyof typeof IMPORT_TYPE_LABELS
                    ] ?? b.importType}
                  </TD>
                  <TD className="text-right text-xs text-ink-600">
                    <span className="font-medium text-ink-900">
                      {b.validRowCount}
                    </span>
                    /{b.rowCount}
                    {b.errorRowCount > 0 ? (
                      <span className="text-status-danger">
                        {" "}
                        · {b.errorRowCount} err
                      </span>
                    ) : null}
                    {b.warningRowCount > 0 ? (
                      <span className="text-status-warn">
                        {" "}
                        · {b.warningRowCount} av
                      </span>
                    ) : null}
                  </TD>
                  <TD>
                    <Badge tone={STATUS_TONE[b.status]} className="text-[10px]">
                      {IMPORT_BATCH_STATUS_LABELS[b.status]}
                    </Badge>
                  </TD>
                  <TD className="text-xs text-ink-500">
                    {formatRelative(b.createdAt)}
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
