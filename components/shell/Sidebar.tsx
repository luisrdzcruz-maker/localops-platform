"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { coreModules } from "@/lib/modules/config";
import { ObraSidebar } from "./ObraSidebar";

const OBRA_PREFIXES = ["/dashboard", "/verticals/construction", "/settings"];

function isObraRoute(pathname: string): boolean {
  return OBRA_PREFIXES.some(
    prefix => pathname === prefix || pathname.startsWith(prefix + "/")
  );
}

function GenericSidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white p-4 lg:block">
      <div className="mb-6 rounded-2xl bg-slate-950 p-4 text-white">
        <div className="text-lg font-bold">LocalOps</div>
        <p className="text-xs text-slate-300">One core, many verticals</p>
      </div>
      <nav className="space-y-1">
        {coreModules
          .filter(m => m.status !== "planned")
          .map(m => (
            <Link
              key={m.key}
              href={m.navPath}
              className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950"
            >
              {m.label}
            </Link>
          ))}
      </nav>
      <div className="mt-6 border-t border-slate-100 pt-4">
        <p className="px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Verticals
        </p>
        <Link
          href="/verticals/construction"
          className="mt-2 block rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
        >
          ObraRentable OS
        </Link>
        <Link
          href="/verticals/dental"
          className="block rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
        >
          DentalOps
        </Link>
        <Link
          href="/verticals/pharma"
          className="block rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
        >
          PharmaOps
        </Link>
      </div>
    </aside>
  );
}

export function Sidebar() {
  const pathname = usePathname() ?? "";
  if (isObraRoute(pathname)) return <ObraSidebar />;
  return <GenericSidebar />;
}
