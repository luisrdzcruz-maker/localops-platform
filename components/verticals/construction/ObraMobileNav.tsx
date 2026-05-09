"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { BuildingIcon, HomeIcon, MoreHorizontalIcon, PlusIcon, WalletIcon } from "./icons";

const items: { href: string; label: string; icon: ReactNode; match: (path: string) => boolean }[] = [
  { href: "/dashboard", label: "Inicio", icon: <HomeIcon className="h-5 w-5" />, match: p => p === "/dashboard" },
  { href: "/verticals/construction/projects", label: "Obras", icon: <BuildingIcon className="h-5 w-5" />, match: p => p.startsWith("/verticals/construction/projects") },
  { href: "/verticals/construction/payments", label: "Cobros", icon: <WalletIcon className="h-5 w-5" />, match: p => p.startsWith("/verticals/construction/payments") },
  { href: "/settings", label: "Más", icon: <MoreHorizontalIcon className="h-5 w-5" />, match: p => p.startsWith("/settings") }
];

export function ObraMobileNav() {
  const pathname = usePathname() ?? "";
  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-3 bottom-3 z-30 flex items-center justify-between rounded-2xl border border-slate-200 bg-white/95 px-2 py-2 shadow-lg backdrop-blur lg:hidden"
    >
      {items.slice(0, 2).map(item => (
        <NavLink key={item.href} href={item.href} label={item.label} icon={item.icon} active={item.match(pathname)} />
      ))}
      <Link
        href="/verticals/construction/actions"
        aria-label="Acciones rápidas"
        className="-mt-8 flex h-14 w-14 items-center justify-center rounded-full bg-obra-500 text-white shadow-lg shadow-obra-500/45 ring-4 ring-white transition hover:bg-obra-600"
      >
        <PlusIcon className="h-6 w-6" />
      </Link>
      {items.slice(2).map(item => (
        <NavLink key={item.href} href={item.href} label={item.label} icon={item.icon} active={item.match(pathname)} />
      ))}
    </nav>
  );
}

function NavLink({ href, label, icon, active }: { href: string; label: string; icon: ReactNode; active: boolean }) {
  return (
    <Link
      href={href}
      className={`flex min-w-[3.5rem] flex-col items-center gap-0.5 px-2 py-2 text-[11px] font-medium transition ${
        active ? "text-obra-700" : "text-slate-500 hover:text-slate-800"
      }`}
    >
      <span aria-hidden>{icon}</span>
      <span>{label}</span>
    </Link>
  );
}
