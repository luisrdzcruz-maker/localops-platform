"use client";

import { usePathname } from "next/navigation";
import { OrganizationSwitcher } from "./OrganizationSwitcher";
import { VerticalSwitcher } from "./VerticalSwitcher";

const OBRA_PREFIXES = ["/dashboard", "/verticals/construction", "/settings"];

function isObraRoute(pathname: string): boolean {
  return OBRA_PREFIXES.some(
    prefix => pathname === prefix || pathname.startsWith(prefix + "/")
  );
}

export function TopBar() {
  const pathname = usePathname() ?? "";
  const obra = isObraRoute(pathname);

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:h-16">
      <div>
        <p className="text-sm font-semibold text-slate-950">
          {obra ? "ObraRentable OS" : "LocalOps Platform"}
        </p>
        <p className="text-xs text-slate-500">
          {obra ? "Para reformistas y oficios" : "Modular micro-SME operations OS"}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <VerticalSwitcher />
        <OrganizationSwitcher />
      </div>
    </header>
  );
}
