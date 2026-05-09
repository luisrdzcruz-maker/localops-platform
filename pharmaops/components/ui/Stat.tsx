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
        "flex flex-col gap-1 rounded-xl border border-ink-200 bg-white p-5 shadow-card",
        className
      )}
      {...props}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-500">
          {label}
        </p>
        {trailing}
      </div>
      <p className="text-2xl font-semibold text-ink-900">{value}</p>
      {hint ? <p className="text-xs text-ink-500">{hint}</p> : null}
    </div>
  );
}
