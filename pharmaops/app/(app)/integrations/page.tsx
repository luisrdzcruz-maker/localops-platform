import { ScrollText, ShieldX, Truck } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { PageHeader } from "@/components/ui/PageHeader";
import { IntegrationCard } from "@/components/integrations/IntegrationCard";
import { ADAPTERS } from "@/lib/integrations/registry";
import { buildDiagnostics } from "@/lib/integrations/diagnostics";
import { getDemoState } from "@/lib/demo/store";

export const metadata = { title: "Integraciones · PharmaOps" };

const TEMPLATE_BY_ADAPTER: Record<string, string> = {
  unycop: "purchase_invoices",
  farmatic: "purchase_invoices",
  nixfarma: "purchase_invoices",
  generic: "suppliers",
};

export default function IntegrationsPage() {
  const state = getDemoState();
  return (
    <div className="flex flex-col">
      <PageHeader
        eyebrow="Integraciones"
        title="Integraciones y adaptadores"
        description="Conexiones con tu software de farmacia y herramientas externas. La MVP es file-based: subes ficheros, PharmaOps los normaliza."
      />
      <div className="flex flex-col gap-6 p-6">
        <Alert tone="info" title="Solo importación por fichero">
          PharmaOps no se conecta directamente a Unycop, Farmatic o Nixfarma en
          esta versión. La arquitectura de adaptadores está preparada para una
          conexión directa futura, sujeta a validación técnica con tu proveedor
          IT y consentimiento legal de la farmacia.
        </Alert>

        <section className="grid gap-4 md:grid-cols-2">
          {ADAPTERS.map((adapter) => (
            <IntegrationCard
              key={adapter.id}
              adapter={adapter}
              diagnostics={buildDiagnostics(adapter, state.importBatches)}
              templateImportType={TEMPLATE_BY_ADAPTER[adapter.id]}
            />
          ))}
        </section>

        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-500">
            Otras integraciones
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <ComingSoon
              icon={<ScrollText className="h-3.5 w-3.5" />}
              title="Gestoría"
              description="Hoy: descarga manual del paquete mensual desde Informes → Paquete para gestoría. Pendiente: envío directo y feed cifrado para la asesoría."
            />
            <ComingSoon
              icon={<Truck className="h-3.5 w-3.5" />}
              title="Pedidos a proveedores"
              description="Pendiente de validación con el distribuidor. Requiere acceso autorizado y plan piloto antes de cualquier piloto real."
            />
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <ShieldX className="h-4 w-4 text-status-danger" />
                  VeriFactu / e-invoicing
                </CardTitle>
                <CardDescription>
                  Facturación electrónica certificada según la normativa AEAT.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Badge tone="danger" className="text-[10px]">
                  No certificado
                </Badge>
              </CardContent>
              <CardFooter className="text-xs text-ink-500">
                PharmaOps no emite facturas oficiales ni certifica VeriFactu.
                La compatibilidad fiscal requiere certificación específica y un
                software homologado.
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
