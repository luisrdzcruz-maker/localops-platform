"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType, SVGProps } from "react";
import {
  BarChart2Icon,
  BuildingIcon,
  CameraIcon,
  ClipboardCopyIcon,
  FileTextIcon,
  HomeIcon,
  PackageIcon,
  ReceiptIcon,
  SettingsIcon,
  TrendingUpIcon,
  WalletIcon
} from "@/components/verticals/construction/icons";

interface NavItem {
  href?: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  match?: (path: string) => boolean;
  comingSoon?: boolean;
}

const MAIN_NAV: NavItem[] = [
  {
    href: "/dashboard",
    label: "Inicio",
    icon: HomeIcon,
    match: p => p === "/dashboard" || p === "/verticals/construction"
  },
  {
    href: "/verticals/construction/projects",
    label: "Obras",
    icon: BuildingIcon,
    match: p => p.startsWith("/verticals/construction/projects")
  },
  {
    label: "Presupuestos",
    icon: ClipboardCopyIcon,
    comingSoon: true
  },
  {
    href: "/verticals/construction/invoices",
    label: "Facturas",
    icon: FileTextIcon,
    match: p => p.startsWith("/verticals/construction/invoices")
  },
  {
    label: "Gastos",
    icon: ReceiptIcon,
    comingSoon: true
  },
  {
    href: "/verticals/construction/payments",
    label: "Cobros",
    icon: WalletIcon,
    match: p => p.startsWith("/verticals/construction/payments")
  },
  {
    href: "/verticals/construction/tickets",
    label: "Tickets",
    icon: CameraIcon,
    match: p => p.startsWith("/verticals/construction/tickets")
  },
  {
    href: "/verticals/construction/profitability",
    label: "Rentabilidad",
    icon: TrendingUpIcon,
    match: p => p.startsWith("/verticals/construction/profitability")
  },
  {
    href: "/verticals/construction/reports",
    label: "Informes",
    icon: BarChart2Icon,
    match: p => p.startsWith("/verticals/construction/reports")
  },
  {
    href: "/verticals/construction/export",
    label: "Gestor",
    icon: PackageIcon,
    match: p => p.startsWith("/verticals/construction/export")
  }
];

const BOTTOM_NAV: NavItem[] = [
  {
    href: "/settings",
    label: "Ajustes",
    icon: SettingsIcon,
    match: p => p.startsWith("/settings")
  }
];

export function ObraSidebar() {
  const pathname = usePathname() ?? "";

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto">
      <div className="flex flex-col p-4 pb-0">
        {/* Brand */}
        <div className="mb-5 rounded-2xl bg-obra-600 px-4 py-3 text-white">
          <p className="text-[13px] font-bold leading-tight tracking-tight">ObraRentable OS</p>
          <p className="mt-0.5 text-[11px] text-obra-100">Para reformistas y oficios</p>
        </div>

        {/* Main nav */}
        <nav className="space-y-0.5" aria-label="Navegación principal">
          {MAIN_NAV.map(item => {
            if (item.comingSoon) {
              return (
                <div
                  key={item.label}
                  className="flex cursor-default items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-300"
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                  <span className="ml-auto rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                    próx.
                  </span>
                </div>
              );
            }
            const isActive = item.match?.(pathname) ?? false;
            return (
              <Link
                key={item.href}
                href={item.href!}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-obra-50 font-semibold text-obra-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                }`}
              >
                <item.icon
                  className={`h-4 w-4 shrink-0 ${isActive ? "text-obra-600" : "text-slate-400"}`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom: settings + back link */}
      <div className="mt-auto space-y-0.5 border-t border-slate-100 p-4">
        {BOTTOM_NAV.map(item => {
          const isActive = item.match?.(pathname) ?? false;
          return (
            <Link
              key={item.href}
              href={item.href!}
              aria-current={isActive ? "page" : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-obra-50 font-semibold text-obra-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
              }`}
            >
              <item.icon
                className={`h-4 w-4 shrink-0 ${isActive ? "text-obra-600" : "text-slate-400"}`}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
        <p className="px-3 pt-2 text-[10px] font-medium uppercase tracking-wide text-slate-300">
          LocalOps Platform
        </p>
      </div>
    </aside>
  );
}
