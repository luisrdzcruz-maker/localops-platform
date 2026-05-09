import { AppShell } from "@/components/shell/AppShell";
import { ObraMobileNav } from "@/components/verticals/construction/ObraMobileNav";

const SETTINGS_SECTIONS = [
  {
    key: "empresa",
    title: "Empresa",
    description: "Nombre, logo, datos fiscales y dirección de tu negocio."
  },
  {
    key: "perfil",
    title: "Mi perfil",
    description: "Nombre, email, foto y preferencias de tu cuenta."
  },
  {
    key: "equipo",
    title: "Equipo",
    description: "Usuarios, roles y permisos de tu organización."
  },
  {
    key: "notificaciones",
    title: "Notificaciones",
    description: "Avisos de cobros, tickets y actualizaciones de obras."
  },
  {
    key: "suscripcion",
    title: "Suscripción y facturación",
    description: "Plan contratado, pagos y facturas de ObraRentable OS."
  },
  {
    key: "integraciones",
    title: "Integraciones",
    description: "Conecta tu banco, gestoría, WhatsApp y herramientas externas."
  },
  {
    key: "seguridad",
    title: "Seguridad",
    description: "Contraseña, autenticación en dos pasos y sesiones activas."
  },
  {
    key: "ayuda",
    title: "Ayuda",
    description: "Guías, soporte y cómo sacarle partido a ObraRentable OS."
  }
];

export default function Page() {
  return (
    <AppShell mobileNav={<ObraMobileNav />}>
      <div className="space-y-6">
        <header>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-obra-600">ObraRentable OS</p>
          <h1 className="mt-1 text-[1.625rem] font-bold leading-tight text-slate-950 sm:text-3xl">Ajustes</h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Configura empresa, equipo, notificaciones, suscripción e integraciones.
          </p>
        </header>

        <div className="rounded-2xl border border-obra-100 bg-obra-50/60 px-4 py-3 text-xs text-obra-800">
          Ajustes disponibles cuando el MVP local se conecte a cuentas reales.
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SETTINGS_SECTIONS.map(section => (
            <div
              key={section.key}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card"
            >
              <p className="text-sm font-semibold text-slate-950">{section.title}</p>
              <p className="mt-1 text-xs text-slate-500">{section.description}</p>
              <span className="mt-3 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Próximamente
              </span>
            </div>
          ))}
        </div>

        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
          ObraRentable OS MVP — datos solo en sesión local.
        </p>
      </div>
    </AppShell>
  );
}
