"use client";

import {
  BarChart3,
  Building2,
  FileSpreadsheet,
  FilePieChart,
  ListChecks,
  PiggyBank,
  Plug,
  Settings,
  Truck,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Panel", icon: BarChart3 },
  { href: "/imports", label: "Importaciones", icon: FileSpreadsheet },
  { href: "/suppliers", label: "Proveedores", icon: Truck },
  { href: "/finance", label: "Finanzas", icon: PiggyBank },
  { href: "/reports", label: "Informes", icon: FilePieChart },
  { href: "/tasks", label: "Tareas", icon: ListChecks },
  { href: "/integrations", label: "Integraciones", icon: Plug },
  { href: "/settings", label: "Ajustes", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-ink-200 bg-white md:flex">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white shadow-card">
          <Building2 className="h-5 w-5" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold text-ink-900">PharmaOps</span>
          <span className="text-[11px] font-medium uppercase tracking-wide text-ink-500">
            MVP
          </span>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 px-3 pb-4">
        {NAV.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition",
                active
                  ? "bg-brand-50 text-brand-700"
                  : "text-ink-600 hover:bg-ink-50 hover:text-ink-900"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-5 pb-5 text-[11px] leading-relaxed text-ink-500">
        Esta versión MVP no se conecta a receta electrónica ni certifica
        cumplimiento fiscal.
      </div>
    </aside>
  );
}
