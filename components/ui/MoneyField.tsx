import type { InputHTMLAttributes } from "react";

export function MoneyField({
  className = "",
  suffix = "€",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { suffix?: string }) {
  return (
    <div className={`relative flex items-center ${className}`}>
      <input
        inputMode="decimal"
        type="number"
        step="0.01"
        min="0"
        {...props}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 pr-10 text-sm tabular-nums outline-none transition focus:border-obra-500 focus:ring-2 focus:ring-obra-100"
      />
      <span className="pointer-events-none absolute right-3 text-sm font-medium text-slate-400">{suffix}</span>
    </div>
  );
}
