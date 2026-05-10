import { cva, type VariantProps } from "class-variance-authority";
import { AlertCircle, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils/cn";

const alertStyles = cva(
  "flex gap-3 rounded-lg border p-4 text-sm leading-relaxed",
  {
    variants: {
      tone: {
        info: "border-status-info/20 bg-status-infoBg text-status-info",
        ok: "border-status-ok/20 bg-status-okBg text-status-ok",
        warn: "border-status-warn/30 bg-status-warnBg text-amber-900",
        danger: "border-status-danger/20 bg-status-dangerBg text-red-900",
        neutral: "border-ink-200 bg-ink-50 text-ink-700",
      },
    },
    defaultVariants: { tone: "neutral" },
  }
);

const iconByTone: Record<NonNullable<VariantProps<typeof alertStyles>["tone"]>, React.ReactNode> = {
  info: <Info className="mt-0.5 h-4 w-4 shrink-0" />,
  ok: <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />,
  warn: <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />,
  danger: <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />,
  neutral: <Info className="mt-0.5 h-4 w-4 shrink-0" />,
};

export interface AlertProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title">,
    VariantProps<typeof alertStyles> {
  title?: React.ReactNode;
  hideIcon?: boolean;
}

export function Alert({
  tone,
  className,
  title,
  hideIcon = false,
  children,
  ...props
}: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(alertStyles({ tone }), className)}
      {...props}
    >
      {!hideIcon && iconByTone[tone ?? "neutral"]}
      {/* min-w-0 + flex-1 + break-words so long sentences wrap cleanly on
          mobile instead of pushing the alert past the viewport. */}
      <div className="flex min-w-0 flex-1 flex-col gap-1 break-words">
        {title ? <p className="font-semibold">{title}</p> : null}
        {children ? <div className="text-current/90">{children}</div> : null}
      </div>
    </div>
  );
}
