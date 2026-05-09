import type { ReactNode } from "react";

export function Field({
  label,
  htmlFor,
  hint,
  error,
  required,
  children,
  className = ""
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label htmlFor={htmlFor} className="block text-xs font-semibold text-slate-700">
        {label}
        {required ? <span className="ml-0.5 text-rentable-risk">*</span> : null}
      </label>
      {children}
      {error ? (
        <p className="text-xs font-medium text-rentable-risk">{error}</p>
      ) : hint ? (
        <p className="text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}
