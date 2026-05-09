import type { IssuedInvoiceStatus } from "@/types/construction";

const statusMap: Record<IssuedInvoiceStatus, { label: string; classes: string }> = {
  draft: { label: "Borrador", classes: "bg-slate-100 text-slate-600" },
  issued: { label: "Emitida", classes: "bg-obra-100 text-obra-700" },
  sent: { label: "Enviada", classes: "bg-obra-500 text-white" },
  paid: { label: "Cobrada", classes: "bg-rentable-healthyBg text-rentable-healthy" },
  overdue: { label: "Vencida", classes: "bg-rentable-riskBg text-rentable-risk font-bold" },
  cancelled: { label: "Anulada", classes: "bg-slate-100 text-slate-500" }
};

export function InvoiceStatusBadge({ status }: { status: IssuedInvoiceStatus }) {
  const cfg = statusMap[status];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${cfg.classes}`}>
      {cfg.label}
    </span>
  );
}

export const invoiceStatusLabels: Record<IssuedInvoiceStatus, string> = Object.fromEntries(
  (Object.entries(statusMap) as [IssuedInvoiceStatus, { label: string }][]).map(([k, v]) => [k, v.label])
) as Record<IssuedInvoiceStatus, string>;
