import { Building2, FileSpreadsheet, Plug, ShieldCheck, Sparkles, Users } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { PageHeader } from "@/components/ui/PageHeader";
import { TBody, TD, TH, THead, TR, Table } from "@/components/ui/Table";
import { DemoToggleBar } from "@/components/dashboard/DemoToggleBar";
import { getDemoState } from "@/lib/demo/store";
import { permissionsFor } from "@/lib/security/permissions";
import {
  getServiceBoundary,
  SERVICE_CATEGORY_LABELS,
  SERVICE_STATUS_LABELS,
  SERVICE_STATUS_TONES,
} from "@/lib/pharmaops/serviceBoundary";
import {
  WORKSPACE_ROLES,
  type WorkspaceRole,
} from "@/types/localops";

const ROLE_LABELS: Record<WorkspaceRole, string> = {
  owner: "Titular / Propietario",
  manager: "Regente / Adjunto",
  staff: "Personal",
  accountant: "Gestoría",
};

export const metadata = { title: "Ajustes · PharmaOps" };

export default function SettingsPage() {
  const state = getDemoState();
  const services = getServiceBoundary();
  return (
    <div className="flex flex-col">
      <PageHeader
        eyebrow="Ajustes"
        title="Configuración"
        description="Datos de la farmacia, usuarios y roles, plantillas de importación, privacidad y branding de informes."
      />
      <div className="flex flex-col gap-6 p-6">
        <DemoToggleBar loaded={state.loaded} />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-brand-600" />
              Perfil de la farmacia
            </CardTitle>
            <CardDescription>
              En esta versión MVP los datos provienen del workspace demo.
              Edición real disponible cuando se conecte Supabase.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-3 md:grid-cols-2">
              <Field label="Nombre" value={state.pharmacy.name} />
              <Field label="NIF/CIF" value={state.pharmacy.taxId} />
              <Field label="Dirección" value={state.pharmacy.address} />
              <Field label="Provincia" value={state.pharmacy.province} />
              <Field
                label="Comunidad autónoma"
                value={state.pharmacy.autonomousCommunity}
              />
              <Field
                label="Email gestoría"
                value={state.pharmacy.accountantEmail}
              />
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4 text-brand-600" />
              Usuarios y roles
            </CardTitle>
            <CardDescription>
              Roles disponibles en LocalOps. La gestión real (invitaciones,
              cambios de rol) se habilita con la integración Supabase Auth.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <THead>
                <TR>
                  <TH>Rol</TH>
                  <TH>Descripción</TH>
                  <TH>Permisos clave</TH>
                </TR>
              </THead>
              <TBody>
                {WORKSPACE_ROLES.map((role) => (
                  <TR key={role}>
                    <TD className="font-medium text-ink-900">
                      {ROLE_LABELS[role]}
                    </TD>
                    <TD className="text-xs text-ink-500">
                      {ROLE_DESCRIPTIONS[role]}
                    </TD>
                    <TD className="text-xs text-ink-600">
                      {permissionsFor(role).slice(0, 5).map((p) => (
                        <Badge key={p} tone="neutral" className="mr-1 text-[10px]">
                          {p}
                        </Badge>
                      ))}
                      {permissionsFor(role).length > 5 ? (
                        <span className="text-ink-400">
                          {" "}
                          +{permissionsFor(role).length - 5} más
                        </span>
                      ) : null}
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-brand-600" />
                Plantillas de importación
              </CardTitle>
              <CardDescription>
                Descarga plantillas Excel listas para rellenar.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm text-ink-700">
              <a
                className="text-brand-700 hover:underline"
                href="/api/integrations/template?type=purchase_invoices"
                download
              >
                Plantilla facturas de compra
              </a>
              <a
                className="text-brand-700 hover:underline"
                href="/api/integrations/template?type=sales_summary"
                download
              >
                Plantilla resumen de ventas
              </a>
              <a
                className="text-brand-700 hover:underline"
                href="/api/integrations/template?type=stock_snapshot"
                download
              >
                Plantilla inventario
              </a>
              <a
                className="text-brand-700 hover:underline"
                href="/api/integrations/template?type=expenses"
                download
              >
                Plantilla gastos
              </a>
              <a
                className="text-brand-700 hover:underline"
                href="/api/integrations/template?type=suppliers"
                download
              >
                Plantilla proveedores
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-brand-600" />
                Privacidad de datos
              </CardTitle>
              <CardDescription>
                Cómo PharmaOps trata los ficheros que importas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 text-sm text-ink-600">
                <li>No almacenamos datos clínicos ni de pacientes.</li>
                <li>Las columnas con identificadores personales se marcan como sensibles y no se mapean por defecto.</li>
                <li>Los lotes de importación se asocian al workspace; RLS bloquea accesos cruzados cuando Supabase está activo.</li>
                <li>Los informes generados son herramientas de gestión, no documentos fiscales oficiales.</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plug className="h-4 w-4 text-brand-600" />
              Servicios externos
            </CardTitle>
            <CardDescription>
              Estado de las conexiones reales. La MVP corre en modo demo: los
              servicios listados como mock o no conectados nunca llaman a un
              proveedor externo desde esta aplicación.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <THead>
                <TR>
                  <TH>Servicio</TH>
                  <TH>Categoría</TH>
                  <TH>Estado</TH>
                  <TH>Notas</TH>
                </TR>
              </THead>
              <TBody>
                {services.map((service) => (
                  <TR key={service.id}>
                    <TD className="align-top">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium text-ink-900">
                          {service.label}
                        </span>
                        <span className="text-[11px] text-ink-500">
                          {service.description}
                        </span>
                      </div>
                    </TD>
                    <TD className="align-top text-xs text-ink-600">
                      {SERVICE_CATEGORY_LABELS[service.category]}
                    </TD>
                    <TD className="align-top">
                      <Badge
                        tone={SERVICE_STATUS_TONES[service.status]}
                        className="text-[10px]"
                      >
                        {SERVICE_STATUS_LABELS[service.status]}
                      </Badge>
                    </TD>
                    <TD className="align-top text-xs text-ink-600">
                      {service.hint}
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </CardContent>
        </Card>

        <ComingSoon
          icon={<Sparkles className="h-3.5 w-3.5" />}
          title="Branding de informes"
          description="En esta versión los informes usan la cabecera estándar PharmaOps. La carga de logo, el pie personalizado y el idioma por defecto del PDF llegan en próximas iteraciones."
        />
      </div>
    </div>
  );
}

const ROLE_DESCRIPTIONS: Record<WorkspaceRole, string> = {
  owner: "Acceso completo a la farmacia, configuración y usuarios.",
  manager: "Gestión operativa: importaciones, finanzas, informes, tareas.",
  staff: "Acceso limitado al panel y tareas operativas.",
  accountant: "Acceso de solo lectura a finanzas, informes y proveedores.",
};

function Field({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-[11px] font-medium uppercase tracking-wide text-ink-500">
        {label}
      </dt>
      <dd className="text-sm text-ink-900">{value ?? "—"}</dd>
    </div>
  );
}
