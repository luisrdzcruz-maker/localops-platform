import { AlertTriangle, Lock, Sparkles } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
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
import { ExtractionStatusButton } from "./ExtractionStatusButton";
import type { DocumentRecord } from "@/types/documents";
import {
  formatDate,
  formatEur,
  formatNumber,
  formatPercent,
} from "@/lib/utils/format";
import type {
  ExtractionStatus,
  InvoiceExtractionField,
  InvoiceExtractionProposal,
  OcrProviderId,
} from "@/lib/ocr/types";

const STATUS_TONE: Record<
  ExtractionStatus,
  "ok" | "warn" | "danger" | "info" | "neutral"
> = {
  not_started: "neutral",
  processing: "info",
  needs_review: "warn",
  failed: "danger",
  confirmed: "ok",
};

const STATUS_LABEL: Record<ExtractionStatus, string> = {
  not_started: "Sin iniciar",
  processing: "Procesando",
  needs_review: "Pendiente de revisar",
  failed: "Error",
  confirmed: "Revisada",
};

const PROVIDER_TONE: Record<OcrProviderId, "info" | "brand"> = {
  mock: "info",
  azure: "brand",
  google: "brand",
  aws: "brand",
};

/**
 * Renders one extraction proposal for review. Receives the document so it
 * can show the file name + type the proposal belongs to.
 */
export function ExtractionPanel({
  document,
  proposal,
}: {
  document: DocumentRecord;
  proposal: InvoiceExtractionProposal;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <CardTitle className="flex flex-wrap items-center gap-2">
              <Sparkles className="h-4 w-4 text-brand-600" />
              <span className="truncate">
                {document.fileName ?? "Documento sin nombre"}
              </span>
              <Badge tone={PROVIDER_TONE[proposal.provider]} className="text-[10px]">
                {providerLabel(proposal.provider)}
              </Badge>
              <Badge tone={STATUS_TONE[proposal.status]} className="text-[10px]">
                {STATUS_LABEL[proposal.status]}
              </Badge>
            </CardTitle>
            <CardDescription>
              Extraído {formatDate(proposal.extractedAt)} · revisa los campos
              antes de marcar la extracción como revisada.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {proposal.warnings.length > 0 ? (
          <Alert tone="warn" title="Atención">
            <ul className="flex flex-col gap-1">
              {proposal.warnings.map((w, i) => (
                <li key={i} className="flex gap-2">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </Alert>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <FieldRow label="Proveedor" field={proposal.supplierName} />
          <FieldRow label="CIF/NIF" field={proposal.supplierTaxId} />
          <FieldRow label="Nº factura" field={proposal.invoiceNumber} />
          <FieldRow label="Fecha factura" field={proposal.invoiceDate} kind="date" />
          <FieldRow label="Vencimiento" field={proposal.dueDate} kind="date" />
          <FieldRow label="Moneda" field={proposal.currency} />
          <FieldRow label="Base imponible" field={proposal.netAmount} kind="money" />
          <FieldRow label="IVA" field={proposal.vatAmount} kind="money" />
          <FieldRow label="Total" field={proposal.grossAmount} kind="money" />
        </div>

        {proposal.lineItems && proposal.lineItems.length > 0 ? (
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold text-ink-900">
              Líneas detectadas
            </p>
            <Table>
              <THead>
                <TR>
                  <TH>Concepto</TH>
                  <TH className="text-right">Cantidad</TH>
                  <TH className="text-right">P. unitario</TH>
                  <TH className="text-right">Base</TH>
                  <TH className="text-right">IVA</TH>
                  <TH className="text-right">Total</TH>
                  <TH className="text-right">Confianza</TH>
                </TR>
              </THead>
              <TBody>
                {proposal.lineItems.map((line, i) => (
                  <TR key={i}>
                    <TD className="text-ink-700">{line.description ?? "—"}</TD>
                    <TD className="text-right">
                      {line.quantity !== undefined ? formatNumber(line.quantity) : "—"}
                    </TD>
                    <TD className="text-right">
                      {line.unitPrice !== undefined ? formatEur(line.unitPrice) : "—"}
                    </TD>
                    <TD className="text-right">
                      {line.netAmount !== undefined ? formatEur(line.netAmount) : "—"}
                    </TD>
                    <TD className="text-right">
                      {line.vatAmount !== undefined ? formatEur(line.vatAmount) : "—"}
                    </TD>
                    <TD className="text-right font-medium">
                      {line.grossAmount !== undefined ? formatEur(line.grossAmount) : "—"}
                    </TD>
                    <TD className="text-right text-xs text-ink-500">
                      {line.confidence !== undefined
                        ? formatPercent(line.confidence)
                        : "—"}
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </div>
        ) : null}
      </CardContent>
      <CardFooter className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          <ExtractionStatusButton
            documentId={proposal.documentId}
            nextStatus="confirmed"
            variant="primary"
          >
            Marcar como revisada
          </ExtractionStatusButton>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled
            title="Siguiente fase: guardar extracción confirmada como gasto o factura."
          >
            <Lock className="h-3.5 w-3.5" />
            Crear gasto/factura desde extracción
          </Button>
        </div>
        <p className="text-[11px] leading-relaxed text-ink-500">
          Siguiente fase: guardar extracción confirmada como gasto o factura.
        </p>
      </CardFooter>
    </Card>
  );
}

function providerLabel(id: OcrProviderId): string {
  switch (id) {
    case "mock":
      return "Demo OCR";
    case "azure":
      return "Azure Document Intelligence";
    case "google":
      return "Google Document AI";
    case "aws":
      return "AWS Textract";
  }
}

interface FieldRowProps<T extends string | number | null> {
  label: string;
  field?: InvoiceExtractionField<T>;
  kind?: "text" | "money" | "date";
}

function FieldRow<T extends string | number | null>({
  label,
  field,
  kind = "text",
}: FieldRowProps<T>) {
  const lowConfidence =
    typeof field?.confidence === "number" && field.confidence < 0.6;
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-ink-200 bg-white p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-medium uppercase tracking-wide text-ink-500">
          {label}
        </p>
        {typeof field?.confidence === "number" ? (
          <Badge
            tone={lowConfidence ? "warn" : "neutral"}
            className="text-[10px]"
          >
            {formatPercent(field.confidence)}
          </Badge>
        ) : null}
      </div>
      <p className="text-sm font-semibold text-ink-900">
        {renderValue(field, kind)}
      </p>
    </div>
  );
}

function renderValue<T extends string | number | null>(
  field: InvoiceExtractionField<T> | undefined,
  kind: "text" | "money" | "date"
): string {
  if (!field || field.value === null || field.value === undefined) return "—";
  if (kind === "money" && typeof field.value === "number") {
    return formatEur(field.value);
  }
  if (kind === "date" && typeof field.value === "string") {
    return formatDate(field.value);
  }
  return String(field.value);
}
