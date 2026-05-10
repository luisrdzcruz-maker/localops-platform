/**
 * Single source of truth for the PharmaOps app navigation.
 *
 * Both the desktop Sidebar and the mobile drawer (MobileNav) read from this
 * list so they can never drift out of sync.
 */

import {
  BarChart3,
  FileSpreadsheet,
  FilePieChart,
  ListChecks,
  PiggyBank,
  Plug,
  Receipt,
  Settings,
  Truck,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Panel", icon: BarChart3 },
  { href: "/imports", label: "Importaciones", icon: FileSpreadsheet },
  { href: "/documents", label: "Documentos", icon: Receipt },
  { href: "/suppliers", label: "Proveedores", icon: Truck },
  { href: "/finance", label: "Finanzas", icon: PiggyBank },
  { href: "/reports", label: "Informes", icon: FilePieChart },
  { href: "/tasks", label: "Tareas", icon: ListChecks },
  { href: "/integrations", label: "Integraciones", icon: Plug },
  { href: "/settings", label: "Ajustes", icon: Settings },
];

export function isNavItemActive(item: NavItem, pathname: string): boolean {
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
