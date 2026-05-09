import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface PageHeaderProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 border-b border-ink-100 bg-white px-6 py-5 md:flex-row md:items-end md:justify-between",
        className
      )}
      {...props}
    >
      <div className="flex flex-col gap-1">
        {eyebrow ? (
          <p className="text-xs font-medium uppercase tracking-wide text-brand-600">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-xl font-semibold text-ink-900 md:text-2xl">
          {title}
        </h1>
        {description ? (
          <p className="max-w-2xl text-sm text-ink-500">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}
