import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col px-6 pb-16 pt-20 sm:pt-24 md:pt-28 lg:pt-32">
      <p className="text-sm font-medium uppercase tracking-wide text-brand-600">
        PharmaOps · MVP
      </p>
      <h1 className="mt-3 text-3xl font-semibold text-ink-900 sm:text-4xl">
        Control operativo de tu farmacia
      </h1>
      <p className="mt-4 max-w-2xl text-base text-ink-600 sm:text-lg">
        Importa datos desde tu sistema, entiende márgenes, controla
        proveedores y prepara informes para tu gestoría — sin sustituir tu
        software oficial de farmacia.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/dashboard"
          className="inline-flex items-center rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white shadow-card transition hover:bg-brand-700"
        >
          Entrar al panel
        </Link>
        <Link
          href="/login"
          className="inline-flex items-center rounded-lg border border-ink-200 bg-white px-5 py-2.5 text-sm font-medium text-ink-700 shadow-card transition hover:bg-ink-50"
        >
          Iniciar sesión
        </Link>
      </div>

      <p className="mt-10 text-xs text-ink-500">
        PharmaOps es una capa de gestión operativa y análisis. No sustituye a
        Unycop, Farmatic, Nixfarma u otros sistemas oficiales de gestión
        farmacéutica. Esta versión MVP no se conecta a receta electrónica ni
        certifica cumplimiento fiscal.
      </p>
    </main>
  );
}
