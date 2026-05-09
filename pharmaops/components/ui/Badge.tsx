import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils/cn";

const badgeStyles = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      tone: {
        neutral: "bg-status-neutralBg text-status-neutral",
        ok: "bg-status-okBg text-status-ok",
        warn: "bg-status-warnBg text-status-warn",
        danger: "bg-status-dangerBg text-status-danger",
        info: "bg-status-infoBg text-status-info",
        brand: "bg-brand-50 text-brand-700",
      },
    },
    defaultVariants: { tone: "neutral" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeStyles> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeStyles({ tone }), className)} {...props} />
  );
}
