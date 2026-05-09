import Link from "next/link";
import type { ConstructionProject, IssuedInvoice } from "@/types/construction";
import { formatEUR } from "@/lib/utils/money";
import { InvoiceStatusBadge } from "./InvoiceStatusBadge";
import { ChevronRightIcon } from "./icons";

function formatDate(value?: string) {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
  } catch {
    return value;
  }
}

export function InvoiceCard({
  invoice,
  clientName,
  project
}: {
  invoice: IssuedInvoice;
  clientName: string;
  project?: ConstructionProject;
}) {
  const projectHref = project ? `/verticals/construction/projects/${project.id}` : "/verticals/construction/projects";
  const pending = Math.max(invoice.total - invoice.paidAmount, 0);
  return (
    <article className={`rounded-2xl border bg-white p-4 shadow-card transition hover:border-obra-300 sm:p-5 ${invoice.status === "overdue" ? "border-l-4 border-slate-200 border-l-rentable-risk" : "border-slate-200"}`}>
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-950">{invoice.invoiceNumber}</p>
          <p className="mt-0.5 truncate text-xs text-slate-500">
            {clientName}
            {project ? <span className="text-slate-400"> · {project.name}</span> : null}
          </p>
        </div>
        <InvoiceStatusBadge status={invoice.status} />
      </header>

      <p className="mt-3 truncate text-sm text-slate-700">{invoice.concept}</p>

      <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Emisión</dt>
          <dd className="mt-0.5 text-xs font-medium text-slate-700">{formatDate(invoice.issueDate)}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Vencimiento</dt>
          <dd className={`mt-0.5 text-xs font-medium ${invoice.status === "overdue" ? "text-rentable-risk" : "text-slate-700"}`}>{formatDate(invoice.dueDate)}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Total</dt>
          <dd className="mt-0.5 text-sm font-semibold tabular-nums text-slate-950">{formatEUR(invoice.total)}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Cobrado</dt>
          <dd className="mt-0.5 text-sm font-semibold tabular-nums text-slate-700">
            {formatEUR(invoice.paidAmount)}
            {pending > 0 && invoice.status !== "draft" && invoice.status !== "cancelled" ? (
              <span className="ml-1 block text-[10px] font-medium tabular-nums text-slate-500 sm:inline">· {formatEUR(pending)} pdte.</span>
            ) : null}
          </dd>
        </div>
      </dl>

      <footer className="mt-4 flex items-center justify-end gap-2">
        <Link
          href={projectHref}
          className="inline-flex items-center gap-1 text-xs font-semibold text-obra-700 transition hover:text-obra-800"
        >
          Ver obra
          <ChevronRightIcon className="h-3.5 w-3.5" />
        </Link>
      </footer>
    </article>
  );
}
