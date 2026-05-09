import Link from "next/link";
import type { ConstructionProject } from "@/types/construction";
import { ObraStatusBadge } from "./ObraStatusBadge";
import { ChevronRightIcon } from "./icons";

export function ObraDetailHeader({ project, clientName }: { project: ConstructionProject; clientName: string }) {
  return (
    <header className="space-y-3">
      <nav aria-label="breadcrumb" className="flex items-center gap-1 text-xs font-medium text-slate-500">
        <Link href="/verticals/construction/projects" className="hover:text-obra-700">Obras</Link>
        <ChevronRightIcon className="h-3.5 w-3.5" />
        <span className="truncate text-slate-700">{project.name}</span>
      </nav>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-obra-600">ObraRentable OS</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">{project.name}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {clientName}
            {project.address ? <span className="text-slate-400"> · {project.address}</span> : null}
          </p>
        </div>
        <ObraStatusBadge status={project.status} />
      </div>
    </header>
  );
}
