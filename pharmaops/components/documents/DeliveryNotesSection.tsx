import { ClipboardList, GitCompare, Receipt } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Stat } from "@/components/ui/Stat";
import { TBody, TD, TH, THead, TR, Table } from "@/components/ui/Table";
import {
  DELIVERY_NOTE_RECONCILIATION_LABELS,
  DELIVERY_NOTE_STATUS_LABELS,
  type DeliveryNote,
  type DeliveryNoteReconciliationStatus,
  type DeliveryNoteStatus,
} from "@/types/delivery-notes";
import { formatDate, formatEur, formatNumber } from "@/lib/utils/format";
import type { DeliveryNoteMetrics } from "@/lib/pharmaops/deliveryNotes";
import { DeliveryNoteStatusActions } from "./DeliveryNoteStatusActions";
import { RegisterDeliveryNoteForm } from "./RegisterDeliveryNoteForm";

const STATUS_TONE: Record<
  DeliveryNoteStatus,
  "ok" | "warn" | "info" | "danger" | "neutral"
> = {
  pendiente_revision: "warn",
  revisado: "info",
  con_incidencias: "danger",
  pendiente_factura: "warn",
  asociado_factura: "ok",
  cerrado: "neutral",
};

const RECONCILIATION_TONE: Record<
  DeliveryNoteReconciliationStatus,
  "ok" | "warn" | "info" | "danger" | "neutral"
> = {
  sin_factura: "neutral",
  pendiente_conciliar: "warn",
  cuadra: "ok",
  diferencias_menores: "warn",
  diferencias_importantes: "danger",
};

export function DeliveryNotesSection({
  notes,
  metrics,
}: {
  notes: DeliveryNote[];
  metrics: DeliveryNoteMetrics;
}) {
  const sorted = [...notes].sort((a, b) =>
    a.deliveryDate < b.deliveryDate ? 1 : -1
  );

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-ink-900">
            <ClipboardList className="h-5 w-5 text-brand-600" />
            Albaranes
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-ink-500">
            Registro de albaranes recibidos. Puedes registrar el albarán
            manualmente y asociarlo más adelante a su factura. PharmaOps no
            modifica el stock oficial de tu sistema de farmacia.
          </p>
        </div>
        <RegisterDeliveryNoteForm />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Albaranes pendientes"
          value={formatNumber(metrics.pending)}
          hint="Pendientes de revisión"
        />
        <Stat
          label="Con incidencias"
          value={formatNumber(metrics.withIssues)}
          hint="Requieren atención"
          trailing={
            metrics.withIssues > 0 ? (
              <Badge tone="danger" className="text-[10px]">
                Atención
              </Badge>
            ) : null
          }
        />
        <Stat
          label="Pendientes de factura"
          value={formatNumber(metrics.awaitingInvoice)}
          hint={
            metrics.estimatedAmountPendingInvoice > 0
              ? `≈ ${formatEur(metrics.estimatedAmountPendingInvoice)} estimado`
              : "Sin importes estimados"
          }
        />
        <Stat
          label="Asociados a factura"
          value={formatNumber(metrics.matchedToInvoice)}
          hint={
            metrics.closed > 0
              ? `${metrics.closed} cerrados archivados`
              : "Conciliación lista"
          }
        />
      </div>

      <Alert tone="info" title="Conciliación con factura">
        Próxima fase: comparar albarán con factura y detectar diferencias en
        precios, cantidades y referencias. En la MVP actual marcamos
        manualmente el estado y dejamos lista la asociación.
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-brand-600" />
            Registro de albaranes
          </CardTitle>
          <CardDescription>
            Histórico de albaranes registrados. Cambia el estado a medida que
            avanza la revisión o cuando llegue la factura del proveedor.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sorted.length === 0 ? (
            <p className="text-sm text-ink-500">
              Aún no hay albaranes registrados. Usa “Registrar albarán” para
              añadir el primero.
            </p>
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Fecha</TH>
                  <TH>Proveedor</TH>
                  <TH>Nº albarán</TH>
                  <TH>Estado</TH>
                  <TH>Conciliación</TH>
                  <TH className="text-right">Importe estimado</TH>
                  <TH>Factura asociada</TH>
                  <TH>Acción</TH>
                </TR>
              </THead>
              <TBody>
                {sorted.map((note) => (
                  <TR key={note.id}>
                    <TD className="text-xs text-ink-500">
                      {formatDate(note.deliveryDate)}
                    </TD>
                    <TD className="text-ink-900">{note.supplierName}</TD>
                    <TD className="text-xs text-ink-700">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium">
                          {note.deliveryNoteNumber}
                        </span>
                        {note.packageCount !== null ? (
                          <span className="text-[10px] text-ink-400">
                            {note.packageCount} bulto
                            {note.packageCount === 1 ? "" : "s"}
                          </span>
                        ) : null}
                      </div>
                    </TD>
                    <TD>
                      <Badge
                        tone={STATUS_TONE[note.status]}
                        className="text-[10px]"
                      >
                        {DELIVERY_NOTE_STATUS_LABELS[note.status]}
                      </Badge>
                    </TD>
                    <TD>
                      <Badge
                        tone={RECONCILIATION_TONE[note.reconciliationStatus]}
                        className="text-[10px]"
                      >
                        {
                          DELIVERY_NOTE_RECONCILIATION_LABELS[
                            note.reconciliationStatus
                          ]
                        }
                      </Badge>
                    </TD>
                    <TD className="text-right text-ink-700">
                      {note.estimatedAmount === null
                        ? "—"
                        : formatEur(note.estimatedAmount)}
                    </TD>
                    <TD className="text-xs text-ink-700">
                      {note.relatedInvoiceNumber ?? (
                        <span className="text-ink-400">Sin factura</span>
                      )}
                    </TD>
                    <TD className="w-[200px]">
                      <div className="flex flex-col gap-1.5">
                        <DeliveryNoteStatusActions note={note} />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 justify-start px-2 text-[11px] text-ink-500"
                          disabled
                          aria-disabled="true"
                          title="Próxima fase: comparar albarán con factura y detectar diferencias."
                        >
                          <GitCompare className="h-3 w-3" />
                          Conciliar próximamente
                        </Button>
                      </div>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
