"use client";

import Link from "next/link";
import { useContact, useProject } from "@/lib/store/sessionStore";
import { ChevronRightIcon } from "../icons";
import { PaymentForm } from "./PaymentForm";

export function PaymentFormView({ projectId }: { projectId: string }) {
  const project = useProject(projectId);
  const contact = useContact(project?.contactId);
  const projectName = project?.name ?? "Obra";
  const clientName = contact?.name ?? "";

  return (
    <div className="space-y-5">
      <header className="space-y-3">
        <nav aria-label="breadcrumb" className="flex items-center gap-1 text-xs font-medium text-slate-500">
          <Link href="/verticals/construction/projects" className="hover:text-obra-700">Obras</Link>
          <ChevronRightIcon className="h-3.5 w-3.5" />
          {project ? (
            <Link href={`/verticals/construction/projects/${projectId}`} className="hover:text-obra-700">
              {projectName}
            </Link>
          ) : (
            <span className="text-slate-700">{projectName}</span>
          )}
          <ChevronRightIcon className="h-3.5 w-3.5" />
          <span className="text-slate-700">Registrar cobro</span>
        </nav>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-obra-600">ObraRentable OS</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">Registrar cobro</h1>
          <p className="mt-1 text-sm text-slate-500">{projectName}{clientName ? ` · ${clientName}` : ""}</p>
        </div>
      </header>
      <PaymentForm projectId={projectId} />
    </div>
  );
}
