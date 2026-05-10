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
  DOCUMENT_SOURCE_LABELS,
  DOCUMENT_STATUS_LABELS,
  DOCUMENT_TYPE_LABELS,
  type DocumentRecord,
  type DocumentStatus,
} from "@/types/documents";
import { formatDate, formatEur } from "@/lib/utils/format";
import { DocumentStatusActions } from "./DocumentStatusActions";
import { ExtractDocumentButton } from "./ExtractDocumentButton";
import type { InvoiceExtractionProposal } from "@/lib/ocr/types";

const STATUS_TONE: Record<DocumentStatus, "ok" | "warn" | "info" | "neutral"> = {
  pendiente_revisar: "warn",
  revisado: "info",
  asociado_gasto: "info",
  listo_gestoria: "ok",
};

export function DocumentsTable({
  documents,
  extractions,
}: {
  documents: DocumentRecord[];
  extractions: InvoiceExtractionProposal[];
}) {
  const extractionByDoc = new Map(
    extractions.map((e) => [e.documentId, e] as const)
  );
  return (
    <Card>
      <CardHeader>
        <CardTitle>Documentos</CardTitle>
        <CardDescription>
          Listado de facturas, tickets, albaranes y documentos asociados a la
          gestoría. El fichero original permanece en tu equipo — la demo sólo
          guarda el nombre y el tamaño como referencia.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <p className="text-sm text-ink-500">
            Aún no hay documentos. Sube tu primera factura o ticket para
            empezar a registrarlos.
          </p>
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>Fecha</TH>
                <TH>Tipo</TH>
                <TH>Proveedor</TH>
                <TH>Categoría</TH>
                <TH>Estado actual</TH>
                <TH className="text-right">Importe estimado</TH>
                <TH>Origen</TH>
                <TH>Extracción</TH>
                <TH>Acción</TH>
              </TR>
            </THead>
            <TBody>
              {documents.map((d) => {
                const extraction = extractionByDoc.get(d.id);
                return (
                <TR key={d.id}>
                  <TD className="text-xs text-ink-500">{formatDate(d.date)}</TD>
                  <TD className="font-medium text-ink-900">
                    {DOCUMENT_TYPE_LABELS[d.type]}
                  </TD>
                  <TD className="text-ink-700">{d.supplierName ?? "—"}</TD>
                  <TD className="text-xs text-ink-500">
                    {d.category ?? "—"}
                  </TD>
                  <TD>
                    <Badge tone={STATUS_TONE[d.status]} className="text-[10px]">
                      {DOCUMENT_STATUS_LABELS[d.status]}
                    </Badge>
                  </TD>
                  <TD className="text-right text-ink-700">
                    {d.estimatedAmount === null
                      ? "—"
                      : formatEur(d.estimatedAmount)}
                  </TD>
                  <TD className="text-xs text-ink-500">
                    {DOCUMENT_SOURCE_LABELS[d.source]}
                    {d.fileName ? (
                      <span className="block truncate text-[10px] text-ink-400">
                        {d.fileName}
                      </span>
                    ) : null}
                  </TD>
                  <TD className="w-[180px]">
                    <div className="flex flex-col gap-1.5">
                      {extraction ? (
                        <Badge
                          tone={
                            extraction.status === "confirmed"
                              ? "ok"
                              : extraction.status === "failed"
                              ? "danger"
                              : "warn"
                          }
                          className="self-start text-[10px]"
                        >
                          {extraction.provider === "mock"
                            ? "Demo OCR"
                            : extraction.provider === "azure"
                            ? "Azure"
                            : extraction.provider}
                          {extraction.status === "confirmed"
                            ? " · revisada"
                            : extraction.warnings.length > 0
                            ? ` · ${extraction.warnings.length} aviso${extraction.warnings.length === 1 ? "" : "s"}`
                            : " · pendiente"}
                        </Badge>
                      ) : (
                        <span className="text-[10px] text-ink-400">
                          Sin extracción
                        </span>
                      )}
                      <ExtractDocumentButton
                        documentId={d.id}
                        hasProposal={Boolean(extraction)}
                      />
                    </div>
                  </TD>
                  <TD className="w-[180px]">
                    <DocumentStatusActions document={d} />
                  </TD>
                </TR>
                );
              })}
            </TBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
