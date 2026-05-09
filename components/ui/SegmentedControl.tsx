"use client";

import type { ReactNode } from "react";

export interface SegmentedOption<TValue extends string> {
  value: TValue;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
}

export function SegmentedControl<TValue extends string>({
  value,
  onChange,
  options,
  ariaLabel
}: {
  value: TValue;
  onChange: (next: TValue) => void;
  options: SegmentedOption<TValue>[];
  ariaLabel?: string;
}) {
  return (
    <div role="tablist" aria-label={ariaLabel} className="inline-flex w-full rounded-2xl border border-slate-200 bg-white p-1 shadow-card">
      {options.map(opt => {
        const isActive = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            disabled={opt.disabled}
            onClick={() => !opt.disabled && onChange(opt.value)}
            className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition ${
              isActive
                ? "bg-obra-500 text-white shadow-sm"
                : opt.disabled
                  ? "cursor-not-allowed text-slate-400"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            {opt.icon ? <span aria-hidden>{opt.icon}</span> : null}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
