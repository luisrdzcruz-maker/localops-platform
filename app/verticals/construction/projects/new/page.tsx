import Link from "next/link";
import { AppShell } from "@/components/shell/AppShell";
import { ObraMobileNav } from "@/components/verticals/construction/ObraMobileNav";
import { ProjectForm } from "@/components/verticals/construction/forms/ProjectForm";
import { ChevronRightIcon } from "@/components/verticals/construction/icons";

export default function Page() {
  return (
    <AppShell mobileNav={<ObraMobileNav />}>
      <div className="space-y-5">
        <header className="space-y-3">
          <nav aria-label="breadcrumb" className="flex items-center gap-1 text-xs font-medium text-slate-500">
            <Link href="/verticals/construction/projects" className="hover:text-obra-700">Obras</Link>
            <ChevronRightIcon className="h-3.5 w-3.5" />
            <span className="text-slate-700">Nueva obra</span>
          </nav>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-obra-600">ObraRentable OS</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">Crear obra</h1>
            <p className="mt-1 text-sm text-slate-500">Define presupuesto, costes estimados y fechas para empezar a controlar la rentabilidad.</p>
          </div>
        </header>
        <ProjectForm />
      </div>
    </AppShell>
  );
}
