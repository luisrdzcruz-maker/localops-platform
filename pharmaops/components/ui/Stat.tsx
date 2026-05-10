import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface StatProps extends React.HTMLAttributes<HTMLDivElement> {
  label: React.ReactNode;
  value: React.ReactNode;
  hint?: React.ReactNode;
  /** Small badge slot — used for trend / change indicators. */
  trailing?: React.ReactNode;
}

export function Stat({
  label,
  value,
  hint,
  trailing,
  className,
  ...props
}: StatProps) {
  return (
    <div
      className={cn(
        // min-w-0 lets the card shrink inside flex/grid parents so the inner
        // truncate utilities actually clip instead of pushing the layout.
        "flex min-w-0 flex-col gap-1 overflow-hidden rounded-xl border border-ink-200 bg-white p-5 shadow-card",
        className
      )}
      {...props}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1 truncate text-xs font-medium uppercase tracking-wide text-ink-500">
          {label}
        </div>
        {trailing ? <div className="shrink-0">{trailing}</div> : null}
      </div>
      <p className="truncate text-2xl font-semibold text-ink-900">{value}</p>
      {hint ? (
        <p className="truncate text-xs text-ink-500">{hint}</p>
      ) : null}
    </div>
  );
}
