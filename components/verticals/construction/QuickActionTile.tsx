import Link from "next/link";
import type { ReactNode } from "react";

export function QuickActionTile({ href, icon, label, description }: { href: string; icon: ReactNode; label: string; description?: string }) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-card transition hover:border-obra-300 hover:bg-obra-50/40 hover:shadow-md"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-obra-50 text-obra-600 group-hover:bg-obra-100">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-slate-950">{label}</span>
        {description ? <span className="mt-0.5 block text-xs text-slate-500">{description}</span> : null}
      </span>
    </Link>
  );
}
