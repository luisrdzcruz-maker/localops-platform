import { ScrollText, Truck, Users } from "lucide-react";
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
          conexión directa futura, sujeta a validación técnica con tu proveedor IT.
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

        <section className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ScrollText className="h-4 w-4 text-brand-600" />
                Gestoría
              </CardTitle>
              <CardDescription>
                Comparte automáticamente el paquete mensual con tu gestoría.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Badge tone="warn" className="text-[10px]">
                Próximamente
              </Badge>
            </CardContent>
            <CardFooter className="text-xs text-ink-500">
              MVP: descarga manual desde Informes → Paquete para gestoría.
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-brand-600" />
                Proveedores
              </CardTitle>
              <CardDescription>
                Pedidos automáticos basados en stock y rotación.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Badge tone="warn" className="text-[10px]">
                Próximamente
              </Badge>
            </CardContent>
            <CardFooter className="text-xs text-ink-500">
              Requiere acceso autorizado al sistema de pedidos del distribuidor.
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-4 w-4 text-brand-600" />
                VeriFactu / e-invoicing
              </CardTitle>
              <CardDescription>
                Compatibilidad con la facturación electrónica certificada.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Badge tone="danger" className="text-[10px]">
                No certificado
              </Badge>
            </CardContent>
            <CardFooter className="text-xs text-ink-500">
              PharmaOps MVP no certifica VeriFactu ni emite facturas oficiales.
              La compatibilidad fiscal requiere certificación legal específica.
            </CardFooter>
          </Card>
        </section>
      </div>
    </div>
  );
}
