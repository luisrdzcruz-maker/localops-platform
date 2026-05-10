import { AlertTriangle } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  /** Optional override for the icon. Defaults to a warning triangle. */
  icon?: React.ReactNode;
}

/**
 * Companion to <EmptyState>: same shape, but framed as an error so it stands
 * out from a normal empty list. Use for "no se pudo cargar X" surfaces and as
 * the body for route-level error.tsx pages.
 */
export function ErrorState({
  title,
  description,
  actions,
  icon,
  className,
  ...props
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-status-danger/20 bg-status-dangerBg/40 px-6 py-12 text-center",
        className
      )}
      {...props}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-status-danger shadow-card">
        {icon ?? <AlertTriangle className="h-5 w-5" />}
      </div>
      <h3 className="text-base font-semibold text-red-900">{title}</h3>
      {description ? (
        <p className="max-w-md text-sm text-red-900/80">{description}</p>
      ) : null}
      {actions ? <div className="mt-2 flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
