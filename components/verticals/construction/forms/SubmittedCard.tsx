import Link from "next/link";
import type { ReactNode } from "react";

export function SubmittedCard({
  title,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  details
}: {
  title: string;
  description?: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  details?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-rentable-healthyBg bg-white p-6 shadow-card">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rentable-healthyBg text-rentable-healthy">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            <path d="m5 12 5 5L20 7" />
          </svg>
        </span>
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-slate-950">{title}</h2>
          {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
        </div>
      </div>

      {details ? <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm">{details}</div> : null}

      <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {secondaryHref && secondaryLabel ? (
          <Link
            href={secondaryHref}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
          >
            {secondaryLabel}
          </Link>
        ) : null}
        <Link
          href={primaryHref}
          className="inline-flex items-center justify-center rounded-xl bg-obra-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-obra-600"
        >
          {primaryLabel}
        </Link>
      </div>

      <p className="mt-4 text-[11px] font-medium uppercase tracking-wide text-slate-400">
        Datos en memoria — sin persistencia real en este MVP.
      </p>
    </div>
  );
}
