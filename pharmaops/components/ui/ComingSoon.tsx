import { Sparkles } from "lucide-react";
import * as React from "react";
import { Badge } from "./Badge";
import { cn } from "@/lib/utils/cn";

export interface ComingSoonProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** Override the "Próximamente" label if you want something more specific. */
  badgeLabel?: string;
  icon?: React.ReactNode;
}

/**
 * Reusable placeholder for features that are part of the product story but
 * are not implemented in the current MVP. Keeps the copy honest — no fake
 * "available soon" claims, no estimated dates.
 */
export function ComingSoon({
  title = "Próximamente",
  description,
  badgeLabel = "Próximamente",
  icon,
  className,
  ...props
}: ComingSoonProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-dashed border-ink-200 bg-ink-50 p-5",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-ink-500 shadow-card">
          {icon ?? <Sparkles className="h-3.5 w-3.5" />}
        </span>
        <h3 className="flex-1 text-sm font-semibold text-ink-900">{title}</h3>
        <Badge tone="neutral" className="text-[10px]">
          {badgeLabel}
        </Badge>
      </div>
      {description ? (
        <p className="text-xs leading-relaxed text-ink-600">{description}</p>
      ) : null}
    </div>
  );
}
