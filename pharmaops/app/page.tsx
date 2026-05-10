import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Database,
  FileDown,
  FilePieChart,
  FileSpreadsheet,
  FileText,
  ListChecks,
  Lock,
  PiggyBank,
  Plug,
  Receipt,
  Settings2,
  ShieldCheck,
  ShieldX,
  TrendingDown,
  Truck,
  Upload,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

export const metadata = {
  title:
    "PharmaOps — Control operativo para farmacias, sin sustituir tu software actual",
  description:
    "Capa de gestión operativa, importación de datos y reporting para farmacias en España. Complementa Unycop, Farmatic o Nixfarma sin sustituir tu sistema oficial.",
};

export default function HomePage() {
  return (
    <main className="bg-[var(--pharmaops-bg)] text-ink-900">
      <Hero />
      <Problem />
      <Solution />
      <Modules />
      <Integration />
      <Compliance />
      <ClosingCta />
    </main>
  );
}

/* ---------------------------------- Hero ---------------------------------- */

function Hero() {
  return (
    <section className="border-b border-ink-100">
      <div className="mx-auto max-w-5xl px-6 pb-16 pt-20 sm:pt-24 md:pt-28 lg:px-8 lg:pt-32">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">
          PharmaOps · MVP
        </p>
        <h1 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight text-ink-900 sm:text-4xl lg:text-5xl">
          Control operativo para farmacias, sin sustituir tu software actual
        </h1>
        <p className="mt-5 max-w-2xl text-base text-ink-600 sm:text-lg">
          Importa datos, organiza facturas, revisa proveedores y genera
          informes de gestión desde una capa adicional preparada para
          integrarse con tu ecosistema actual.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white shadow-card transition hover:bg-brand-700"
          >
            Entrar a la demo
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="#modulos"
            className="inline-flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-5 py-2.5 text-sm font-medium text-ink-700 shadow-card transition hover:bg-ink-50"
          >
            Ver módulos
          </a>
        </div>

        <p className="mt-10 max-w-2xl text-xs leading-relaxed text-ink-500">
          PharmaOps no sustituye a Unycop, Farmatic, Nixfarma u otros sistemas
          oficiales. Esta versión MVP no se conecta a receta electrónica, no
          almacena datos clínicos ni certifica cumplimiento fiscal.
        </p>
      </div>
    </section>
  );
}

/* -------------------------------- Problem --------------------------------- */

interface Pain {
  icon: LucideIcon;
  title: string;
  body: string;
}

const PAINS: Pain[] = [
  {
    icon: Database,
    title: "Datos repartidos en varios sitios",
    body:
      "Software de farmacia para dispensación, hojas de Excel para gastos, ficheros del proveedor para compras y la gestoría aparte. Cada decisión tarda más de lo que debería.",
  },
  {
    icon: TrendingDown,
    title: "Poco control rápido sobre el negocio",
    body:
      "Es difícil ver de un vistazo márgenes por familia, gasto por proveedor o facturas vencidas. Cuando se detecta un problema, ya ha pasado.",
  },
  {
    icon: FileText,
    title: "Informes mensuales manuales",
    body:
      "Preparar el cierre para gestoría implica copiar, pegar, cuadrar totales y revisar IVA cada mes. Mucho tiempo invertido en algo repetitivo.",
  },
];

function Problem() {
  return (
    <section className="border-b border-ink-100 bg-white">
      <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20 lg:px-8 lg:py-24">
        <SectionHeader
          eyebrow="El problema"
          title="Tres dolores comunes en una farmacia que ya factura bien"
          lead="No es un problema de software de farmacia. Es lo que pasa por encima de él: la gestión, los proveedores, la gestoría, los Excel sueltos."
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PAINS.map((pain) => (
            <PainCard key={pain.title} pain={pain} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PainCard({ pain }: { pain: Pain }) {
  const Icon = pain.icon;
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-ink-200 bg-white p-6 shadow-card">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-status-warnBg text-status-warn">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-base font-semibold text-ink-900">{pain.title}</h3>
      <p className="text-sm leading-relaxed text-ink-600">{pain.body}</p>
    </div>
  );
}

/* -------------------------------- Solution -------------------------------- */

interface Step {
  icon: LucideIcon;
  title: string;
  body: string;
}

const STEPS: Step[] = [
  {
    icon: Upload,
    title: "1. Importar Excel/CSV",
    body:
      "Sube exportaciones de Unycop, Farmatic, Nixfarma o ficheros genéricos.",
  },
  {
    icon: Settings2,
    title: "2. Mapear columnas",
    body: "PharmaOps propone un mapeo y tú lo confirmas o ajustas.",
  },
  {
    icon: CheckCircle2,
    title: "3. Validar datos",
    body: "Detección de errores, avisos y filas duplicadas antes de aplicar.",
  },
  {
    icon: BarChart3,
    title: "4. Ver KPIs",
    body: "Ventas, compras, margen, gasto por proveedor y facturas pendientes.",
  },
  {
    icon: FileDown,
    title: "5. Generar PDF/Excel",
    body: "Informes para revisión interna y paquete listo para gestoría.",
  },
];

function Solution() {
  return (
    <section className="border-b border-ink-100">
      <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20 lg:px-8 lg:py-24">
        <SectionHeader
          eyebrow="Cómo funciona"
          title="Un flujo simple, de un Excel a un informe revisable"
          lead="Cinco pasos. Sin migrar tu software de farmacia, sin tocar receta electrónica."
        />

        <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {STEPS.map((step) => (
            <StepCard key={step.title} step={step} />
          ))}
        </ol>
      </div>
    </section>
  );
}

function StepCard({ step }: { step: Step }) {
  const Icon = step.icon;
  return (
    <li className="flex flex-col gap-2 rounded-xl border border-ink-200 bg-white p-5 shadow-card">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-sm font-semibold text-ink-900">{step.title}</p>
      <p className="text-xs leading-relaxed text-ink-600">{step.body}</p>
    </li>
  );
}

/* --------------------------------- Modules -------------------------------- */

interface Module {
  icon: LucideIcon;
  title: string;
  body: string;
}

const MODULES: Module[] = [
  {
    icon: FileSpreadsheet,
    title: "Importaciones",
    body:
      "Subir un Excel/CSV y dejarlo normalizado: detección de adaptador, mapeo guiado, validación con Zod e historial de lotes.",
  },
  {
    icon: Receipt,
    title: "Documentos",
    body:
      "Sube o fotografía facturas y documentos, registra albaranes y prepara su conciliación con facturas. La extracción asistida propone proveedor, fecha, IVA y total para revisión.",
  },
  {
    icon: Truck,
    title: "Proveedores",
    body:
      "Listado con gasto acumulado, facturas pendientes, plazo medio de pago y detalle por proveedor con tendencia mensual.",
  },
  {
    icon: PiggyBank,
    title: "Finanzas",
    body:
      "Gastos, IVA estimado por tipo, flujo de caja a 30 días y paquete agregado por categoría para tu gestoría.",
  },
  {
    icon: FilePieChart,
    title: "Informes",
    body:
      "PDF e Excel/CSV para gestión mensual, gasto por proveedor, paquete contable, IVA y stock en riesgo.",
  },
  {
    icon: ListChecks,
    title: "Tareas",
    body:
      "Recordatorios automáticos: pagos a proveedores, productos cerca de caducar, importaciones con errores y cierre mensual.",
  },
  {
    icon: Plug,
    title: "Integraciones",
    body:
      "Adaptadores para Unycop, Farmatic, Nixfarma y Excel genérico, con plantillas descargables y diagnóstico por sistema.",
  },
];

function Modules() {
  return (
    <section
      id="modulos"
      className="scroll-mt-12 border-b border-ink-100 bg-white"
    >
      <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20 lg:px-8 lg:py-24">
        <SectionHeader
          eyebrow="Qué incluye la demo"
          title="Seis módulos que cubren la gestión operativa diaria"
          lead="Todo se prueba en la demo con datos ficticios deterministas. No hay datos reales de pacientes ni de recetas."
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((module) => (
            <ModuleCard key={module.title} module={module} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ModuleCard({ module }: { module: Module }) {
  const Icon = module.icon;
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-ink-200 bg-white p-6 shadow-card transition hover:shadow-cardHover">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-base font-semibold text-ink-900">{module.title}</h3>
      <p className="text-sm leading-relaxed text-ink-600">{module.body}</p>
    </div>
  );
}

/* ------------------------------ Integration ------------------------------- */

interface IntegrationPoint {
  icon: LucideIcon;
  title: string;
  body: string;
}

const INTEGRATIONS: IntegrationPoint[] = [
  {
    icon: FileSpreadsheet,
    title: "Hoy: importación por fichero",
    body:
      "Subes el Excel/CSV exportado desde tu sistema de farmacia o lo construyes con la plantilla. Funciona desde el primer día sin tocar tu software actual.",
  },
  {
    icon: Plug,
    title: "Mañana: arquitectura de adaptadores",
    body:
      "Adaptadores listos para Unycop, Farmatic y Nixfarma. Cuando tu proveedor IT autorice acceso, sustituimos el paso de importación manual sin cambiar la app.",
  },
  {
    icon: Lock,
    title: "Conexión directa: sólo bajo validación",
    body:
      "La conexión por API o base de datos requiere validación técnica con tu proveedor IT y aceptación legal de la farmacia. Nunca se activa por defecto.",
  },
];

function Integration() {
  return (
    <section className="border-b border-ink-100">
      <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20 lg:px-8 lg:py-24">
        <SectionHeader
          eyebrow="Integraciones"
          title="Compatible con tu sistema actual, no en lugar de él"
          lead="PharmaOps añade una capa de gestión y reporting. Tu software de farmacia sigue siendo el sistema oficial."
        />

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {INTEGRATIONS.map((point) => (
            <IntegrationCard key={point.title} point={point} />
          ))}
        </div>
      </div>
    </section>
  );
}

function IntegrationCard({ point }: { point: IntegrationPoint }) {
  const Icon = point.icon;
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-ink-200 bg-white p-6 shadow-card">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-status-infoBg text-status-info">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-base font-semibold text-ink-900">{point.title}</h3>
      <p className="text-sm leading-relaxed text-ink-600">{point.body}</p>
    </div>
  );
}

/* -------------------------------- Compliance ------------------------------ */

const COMPLIANCE_NEGATIVES: string[] = [
  "No sustituye al software oficial de farmacia (Unycop, Farmatic, Nixfarma u otros).",
  "No se conecta a receta electrónica del SNS ni a sistemas autonómicos.",
  "No almacena datos clínicos, prescripciones ni identificadores de pacientes.",
  "No certifica VeriFactu, IVA o cumplimiento fiscal por sí mismo.",
];

function Compliance() {
  return (
    <section className="border-b border-ink-100 bg-white">
      <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20 lg:px-8 lg:py-24">
        <SectionHeader
          eyebrow="Honestidad regulatoria"
          title="Qué PharmaOps NO hace"
          lead="Lo decimos antes que después: estos límites están en la base del producto y se mantienen visibles dentro de la app."
        />

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          <div className="rounded-xl border border-status-danger/20 bg-status-dangerBg/40 p-6 lg:col-span-2">
            <div className="flex items-center gap-2">
              <ShieldX className="h-5 w-5 text-status-danger" />
              <h3 className="text-base font-semibold text-red-900">
                Fuera del alcance
              </h3>
            </div>
            <ul className="mt-4 flex flex-col gap-2 text-sm text-red-900/90">
              {COMPLIANCE_NEGATIVES.map((line) => (
                <li key={line} className="flex gap-2">
                  <span aria-hidden="true" className="text-red-900/60">
                    ·
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-3 rounded-xl border border-status-ok/20 bg-status-okBg/60 p-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-status-ok" />
              <h3 className="text-base font-semibold text-status-ok">
                Lo que sí ofrece
              </h3>
            </div>
            <p className="text-sm leading-relaxed text-status-ok/90">
              Informes de gestión revisables por tu gestoría, agregaciones por
              categoría e IVA estimado. Las cifras son herramientas para tomar
              decisiones operativas, no documentos fiscales oficiales.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------- Closing CTA ------------------------------ */

function ClosingCta() {
  return (
    <section>
      <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20 lg:px-8 lg:py-24">
        <div className="rounded-2xl border border-brand-200 bg-brand-50 p-8 sm:p-10 lg:p-12">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
                Demo lista
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-ink-900 sm:text-3xl">
                Prueba PharmaOps con datos ficticios deterministas
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-700 sm:text-base">
                Importa, mapea, valida, genera un informe en PDF y revisa
                cómo se vería con tu farmacia. La demo no requiere registro
                ni datos reales.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white shadow-card transition hover:bg-brand-700"
              >
                Entrar a la demo
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-5 py-2.5 text-sm font-medium text-ink-700 shadow-card transition hover:bg-ink-50"
              >
                Iniciar sesión
              </Link>
            </div>
          </div>
        </div>

        <p className="mt-8 max-w-3xl text-xs leading-relaxed text-ink-500">
          PharmaOps es una capa de gestión operativa y análisis. No sustituye
          a Unycop, Farmatic, Nixfarma u otros sistemas oficiales de gestión
          farmacéutica. Esta versión MVP no se conecta a receta electrónica
          ni certifica cumplimiento fiscal. Los informes generados son
          herramientas de gestión y deben ser revisados por profesionales
          autorizados cuando corresponda.
        </p>
      </div>
    </section>
  );
}

/* -------------------------------- Helpers --------------------------------- */

function SectionHeader({
  eyebrow,
  title,
  lead,
}: {
  eyebrow: string;
  title: string;
  lead: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">
        {eyebrow}
      </p>
      <h2 className="max-w-3xl text-2xl font-semibold text-ink-900 sm:text-3xl lg:text-4xl">
        {title}
      </h2>
      <p className="max-w-2xl text-sm text-ink-600 sm:text-base">{lead}</p>
    </div>
  );
}
