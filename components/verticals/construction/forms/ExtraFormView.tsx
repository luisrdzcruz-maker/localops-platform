"use client";

import Link from "next/link";
import { useProject } from "@/lib/store/sessionStore";
import { ChevronRightIcon } from "../icons";
import { ExtraForm } from "./ExtraForm";

export function ExtraFormView({ projectId }: { projectId: string }) {
  const project = useProject(projectId);

  return (
    <div className="space-y-5">
      <header className="space-y-3">
        <nav aria-label="breadcrumb" className="flex items-center gap-1 text-xs font-medium text-slate-500">
          <Link href="/verticals/construction/projects" className="hover:text-obra-700">Obras</Link>
          <ChevronRightIcon className="h-3.5 w-3.5" />
          {project ? (
            <Link href={`/verticals/construction/projects/${projectId}`} className="hover:text-obra-700">
              {project.name}
            </Link>
          ) : (
            <span className="text-slate-700">Obra</span>
          )}
          <ChevronRightIcon className="h-3.5 w-3.5" />
          <span className="text-slate-700">Nuevo extra</span>
        </nav>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-obra-600">ObraRentable OS</p>
          <h1 className="mt-1 text-[1.625rem] font-bold leading-tight text-slate-950 sm:text-3xl">Añadir extra</h1>
          <p className="mt-1.5 text-sm text-slate-500">
            {project
              ? `${project.name} · trabajo adicional fuera de presupuesto.`
              : "Registra trabajos fuera del presupuesto acordado con el cliente."}
          </p>
        </div>
      </header>
      <ExtraForm projectId={projectId} />
    </div>
  );
}
