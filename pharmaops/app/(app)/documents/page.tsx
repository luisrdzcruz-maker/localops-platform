import { Receipt, Sparkles } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/ui/PageHeader";
import { Stat } from "@/components/ui/Stat";
import { DeliveryNotesSection } from "@/components/documents/DeliveryNotesSection";
import { DocumentsTable } from "@/components/documents/DocumentsTable";
import { ExtractionPanel } from "@/components/documents/ExtractionPanel";
import { UploadCards } from "@/components/documents/UploadCards";
import { computeDeliveryNoteMetrics } from "@/lib/pharmaops/deliveryNotes";
import { computeDocumentMetrics } from "@/lib/pharmaops/documents";
import { getDemoState } from "@/lib/demo/store";
import { resolveOcrProvider } from "@/lib/ocr/provider";
import { formatNumber } from "@/lib/utils/format";

export const metadata = { title: "Documentos · PharmaOps" };

export default function DocumentsPage() {
  const state = getDemoState();
  const metrics = computeDocumentMetrics(state.documents);
  const deliveryNoteMetrics = computeDeliveryNoteMetrics(state.deliveryNotes);
  const extractions = state.documentExtractions;
  const ocr = resolveOcrProvider();
  const docById = new Map(state.documents.map((d) => [d.id, d] as const));
  const extractionsPending = extractions.filter(
    (e) => e.status === "needs_review" || e.status === "processing"
  ).length;

  return (
    <div className="flex flex-col">
      <PageHeader
        eyebrow={
          <span className="flex items-center gap-1.5">
            <Receipt className="h-3.5 w-3.5" />
            Documentos
          </span>
        }
        title="Facturas y documentos"
        description="Centraliza facturas, tickets, albaranes y documentos para preparar revisiones internas o paquetes para gestoría."
      />

      <div className="flex flex-col gap-6 p-6">
        <Alert tone="warn" title="Privacidad de los documentos">
          Evita subir documentos con datos de pacientes o información clínica.
          PharmaOps MVP organiza documentos de gestión y no procesa receta
          electrónica ni historiales sanitarios. En esta demo sólo se guarda
          la metadata (nombre, tipo y fecha) — los ficheros no salen de tu
          equipo.
        </Alert>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Stat
            label="Documentos registrados"
            value={formatNumber(metrics.total)}
            hint="Total en la demo"
          />
          <Stat
            label="Pendientes de revisar"
            value={formatNumber(metrics.pendingReview)}
            hint="Cualquier tipo"
          />
          <Stat
            label="Facturas por revisar"
            value={formatNumber(metrics.invoicesPendingReview)}
            hint="Sólo facturas de proveedor"
          />
          <Stat
            label="Extracciones pendientes"
            value={formatNumber(extractionsPending)}
            hint="Esperan revisión humana"
            trailing={
              <Badge tone="info" className="gap-1 text-[10px]">
                <Sparkles className="h-3 w-3" />
                {ocr.provider.id === "mock" ? "Demo OCR" : ocr.provider.name}
              </Badge>
            }
          />
        </div>

        <Alert tone="info" title="Extracción asistida">
          Revisa siempre los datos antes de guardarlos. PharmaOps MVP no
          contabiliza automáticamente facturas ni sustituye la revisión de tu
          gestoría. {ocr.fellBackToMock
            ? "El proveedor real no está configurado: se usa la extracción demo."
            : ocr.provider.id === "mock"
            ? "OCR_PROVIDER no está activo: se usa la extracción demo."
            : `Proveedor activo: ${ocr.provider.name}.`}
        </Alert>

        <UploadCards />

        <DocumentsTable
          documents={state.documents}
          extractions={extractions}
        />

        <DeliveryNotesSection
          notes={state.deliveryNotes}
          metrics={deliveryNoteMetrics}
        />

        {extractions.length > 0 ? (
          <section className="flex flex-col gap-4">
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="text-lg font-semibold text-ink-900">
                Propuestas de extracción
              </h2>
              <p className="text-xs text-ink-500">
                {extractions.length} propuesta
                {extractions.length === 1 ? "" : "s"} en revisión
              </p>
            </div>
            <div className="flex flex-col gap-4">
              {extractions.map((proposal) => {
                const doc = docById.get(proposal.documentId);
                if (!doc) return null;
                return (
                  <ExtractionPanel
                    key={proposal.documentId}
                    document={doc}
                    proposal={proposal}
                  />
                );
              })}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
