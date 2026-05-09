"use client";

import Link from "next/link";
import { useContact, useProject } from "@/lib/store/sessionStore";
import { ChevronRightIcon } from "../icons";
import { InvoiceForm } from "./InvoiceForm";

export function InvoiceFormView({ projectId }: { projectId?: string }) {
  const project = useProject(projectId);
  const contact = useContact(project?.contactId);
  const projectName = project?.name;
  const clientName = contact?.name;

  return (
    <div className="space-y-5">
      <header className="space-y-3">
        <nav aria-label="breadcrumb" className="flex items-center gap-1 text-xs font-medium text-slate-500">
          {projectId ? (
            <>
              <Link href="/verticals/construction/projects" className="hover:text-obra-700">Obras</Link>
              <ChevronRightIcon className="h-3.5 w-3.5" />
              {project ? (
                <Link href={`/verticals/construction/projects/${projectId}`} className="hover:text-obra-700">
                  {projectName ?? "Obra"}
                </Link>
              ) : (
                <span className="text-slate-700">Obra</span>
              )}
              <ChevronRightIcon className="h-3.5 w-3.5" />
              <span className="text-slate-700">Nueva factura</span>
            </>
          ) : (
            <>
              <Link href="/verticals/construction/invoices" className="hover:text-obra-700">Facturas</Link>
              <ChevronRightIcon className="h-3.5 w-3.5" />
              <span className="text-slate-700">Nueva factura</span>
            </>
          )}
        </nav>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-obra-600">ObraRentable OS</p>
          <h1 className="mt-1 text-[1.625rem] font-bold leading-tight text-slate-950 sm:text-3xl">Emitir factura</h1>
          <p className="mt-1.5 text-sm text-slate-500">
            {projectName
              ? `${projectName}${clientName ? ` · ${clientName}` : ""}`
              : "Crea una factura para una obra y registra cuándo la cobras."}
          </p>
        </div>
      </header>
      <InvoiceForm defaultProjectId={projectId} />
    </div>
  );
}
