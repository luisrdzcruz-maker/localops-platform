import type { InputHTMLAttributes } from "react";
export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-obra-500 focus:ring-2 focus:ring-obra-100 ${className}`}
      {...props}
    />
  );
}
