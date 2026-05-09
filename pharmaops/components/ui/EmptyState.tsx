import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  actions,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-ink-200 bg-white px-6 py-12 text-center",
        className
      )}
      {...props}
    >
      {icon ? (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-700">
          {icon}
        </div>
      ) : null}
      <h3 className="text-base font-semibold text-ink-900">{title}</h3>
      {description ? (
        <p className="max-w-md text-sm text-ink-500">{description}</p>
      ) : null}
      {actions ? <div className="mt-2 flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
