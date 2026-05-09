import type { HTMLAttributes } from "react";
export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) { return <div className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`} {...props} />; }
export function CardHeader({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) { return <div className={`mb-4 ${className}`} {...props} />; }
export function CardTitle({ className = "", ...props }: HTMLAttributes<HTMLHeadingElement>) { return <h3 className={`text-base font-semibold text-slate-950 ${className}`} {...props} />; }
export function CardDescription({ className = "", ...props }: HTMLAttributes<HTMLParagraphElement>) { return <p className={`mt-1 text-sm text-slate-500 ${className}`} {...props} />; }
