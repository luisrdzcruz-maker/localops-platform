"use client";

import { Building2, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { NAV_ITEMS, isNavItemActive } from "./nav";

interface MobileNavProps {
  pharmacyName: string;
  userInitials?: string;
}

/**
 * Mobile-only top bar + slide-out drawer.
 *
 * Renders nothing on `md:` and up — the desktop Sidebar + Topbar take over
 * at that breakpoint. On small screens this component owns the navigation
 * surface entirely:
 *   - top bar with hamburger + brand + workspace + avatar
 *   - drawer with the same NAV_ITEMS as the desktop sidebar
 *   - closes on link click, Escape, or backdrop tap; locks body scroll
 *     while open so the page doesn't scroll behind it.
 */
export function MobileNav({
  pharmacyName,
  userInitials = "OD",
}: MobileNavProps) {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  // Close drawer when the route changes — covers link clicks via Next router
  // without each link needing its own onClick.
  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll while the drawer is open so taps behind don't scroll.
  React.useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Close on Escape — only attached while open so the listener cost is zero
  // when the drawer is idle.
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <header className="flex items-center gap-3 border-b border-ink-200 bg-white px-4 py-2.5 md:hidden">
        <button
          type="button"
          aria-label="Abrir menú"
          aria-expanded={open}
          aria-controls="pharmaops-mobile-drawer"
          onClick={() => setOpen(true)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-ink-200 bg-white text-ink-700 shadow-card transition hover:bg-ink-50"
        >
          <Menu className="h-4 w-4" />
        </button>
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white shadow-card">
            <Building2 className="h-4 w-4" />
          </div>
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-sm font-semibold text-ink-900">
              PharmaOps
            </span>
            <span className="truncate text-[11px] text-ink-500">
              {pharmacyName}
            </span>
          </div>
        </div>
        <div
          aria-label="Tu cuenta"
          className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white"
        >
          {userInitials}
        </div>
      </header>

      <div
        className={cn(
          "fixed inset-0 z-40 md:hidden",
          open ? "pointer-events-auto" : "pointer-events-none"
        )}
        aria-hidden={!open}
      >
        <div
          onClick={() => setOpen(false)}
          className={cn(
            "absolute inset-0 bg-ink-900/50 transition-opacity duration-200",
            open ? "opacity-100" : "opacity-0"
          )}
        />
        <aside
          id="pharmaops-mobile-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Menú de navegación"
          className={cn(
            "absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col bg-white shadow-2xl transition-transform duration-200 ease-out",
            open ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex items-center justify-between gap-2 border-b border-ink-100 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white shadow-card">
                <Building2 className="h-5 w-5" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-semibold text-ink-900">
                  PharmaOps
                </span>
                <span className="text-[11px] font-medium uppercase tracking-wide text-ink-500">
                  MVP
                </span>
              </div>
            </div>
            <button
              type="button"
              aria-label="Cerrar menú"
              onClick={() => setOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-ink-200 bg-white text-ink-700 shadow-card transition hover:bg-ink-50"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-3">
            {NAV_ITEMS.map((item) => {
              const active = isNavItemActive(item, pathname);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition",
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

          <div className="border-t border-ink-100 px-5 py-3 text-[11px] leading-relaxed text-ink-500">
            Esta versión MVP no se conecta a receta electrónica ni certifica
            cumplimiento fiscal.
          </div>
        </aside>
      </div>
    </>
  );
}
