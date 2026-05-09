export type ProgressTone = "primary" | "healthy" | "warning" | "risk";

const toneMap: Record<ProgressTone, string> = {
  primary: "bg-obra-500",
  healthy: "bg-rentable-healthy",
  warning: "bg-rentable-pending",
  risk: "bg-rentable-risk"
};

export function ProgressBar({ value, max, tone = "primary", className = "" }: { value: number; max: number; tone?: ProgressTone; className?: string }) {
  const safeMax = max > 0 ? max : 1;
  const ratio = Math.min(Math.max(value / safeMax, 0), 1);
  const percent = ratio * 100;
  const overflow = max > 0 && value > max;
  return (
    <div className={`h-1.5 w-full overflow-hidden rounded-full bg-slate-100 ${className}`}>
      <div
        className={`h-full ${overflow ? toneMap.risk : toneMap[tone]}`}
        style={{ width: `${percent}%` }}
        role="progressbar"
        aria-valuenow={Math.round(percent)}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  );
}
