import { Alert } from "@/components/ui/Alert";
import { PageHeader } from "@/components/ui/PageHeader";
import { ImportBatchList } from "@/components/imports/ImportBatchList";
import { ImportFlow } from "@/components/imports/ImportFlow";
import { getDemoState } from "@/lib/demo/store";

export const metadata = { title: "Importaciones · PharmaOps" };

export default function ImportsPage() {
  const state = getDemoState();

  return (
    <div className="flex flex-col">
      <PageHeader
        eyebrow="Importaciones"
        title="Centro de importaciones"
        description="Sube exportaciones de Unycop, Farmatic, Nixfarma o ficheros Excel/CSV genéricos. Detección automática, mapeo guiado y validación previa."
      />
      <div className="flex flex-col gap-6 p-6">
        <Alert tone="info" title="Privacidad y datos sensibles">
          Si tu fichero incluye columnas con datos personales de pacientes o
          recetas, no las mapees: PharmaOps trabaja con datos operativos y
          financieros, no con datos clínicos.
        </Alert>
        <ImportFlow />
        <ImportBatchList batches={state.importBatches} />
      </div>
    </div>
  );
}
