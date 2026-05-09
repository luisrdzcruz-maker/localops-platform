import { Alert } from "@/components/ui/Alert";
import { PageHeader } from "@/components/ui/PageHeader";
import { GeneratedReportsTable } from "@/components/reports/GeneratedReportsTable";
import { ReportCard } from "@/components/reports/ReportCard";
import { defaultPeriod } from "@/lib/reports/engine";
import { REPORT_DEFINITIONS } from "@/lib/reports/registry";
import { getDemoState } from "@/lib/demo/store";

export const metadata = { title: "Informes · PharmaOps" };

export default function ReportsPage() {
  const state = getDemoState();
  const period = defaultPeriod();
  const definitions = REPORT_DEFINITIONS.map((d) => ({
    id: d.id,
    title: d.title,
    description: d.description,
    formats: d.formats,
  }));

  return (
    <div className="flex flex-col">
      <PageHeader
        eyebrow="Informes"
        title="Informes y exportaciones"
        description="Genera PDF e Excel/CSV. Periodo por defecto: el mes anterior. Cambia las fechas en cada tarjeta antes de descargar."
      />
      <div className="flex flex-col gap-6 p-6">
        <Alert tone="warn" title="Cifras de gestión">
          Los informes son una herramienta de gestión a partir de los datos
          importados. Tu gestoría sigue siendo responsable de la presentación
          fiscal oficial.
        </Alert>
        <div className="grid gap-4 md:grid-cols-2">
          {definitions.map((d) => (
            <ReportCard
              key={d.id}
              definition={d}
              defaultPeriodStart={period.start}
              defaultPeriodEnd={period.end}
            />
          ))}
        </div>
        <GeneratedReportsTable reports={state.reports} />
      </div>
    </div>
  );
}
